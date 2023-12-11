// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IERC4907.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";



contract GPTStore is IERC4907, ERC721URIStorage,  ReentrancyGuard {

    AggregatorV3Interface internal dataFeed;
    

    struct Assistant {
        string assistantID;
        uint256 pricePerHour;
        address owner;
    }

    struct UserInfo 
    {
        address user;   // address of user role
        uint64 expires; // unix timestamp, user expires
        uint256 payment;
        uint256 assistantNo;
    }

    uint256 private nftId = 1;
    uint256 private assistNo = 1;
    address private devAddress;
    uint256[] private assistantIds; // Array to store assistant IDs


    uint256 public minRentalTime = 1800; // 30 mins
    uint256 public maxRentalTime = 2592000; // 30 days

    mapping(uint256 => UserInfo) private _userInfo;
    mapping(uint256 => Assistant) public assistantsGroups;
    // Mapping to store rented assistants for each user
    mapping(address => uint256[]) private userRentedAssistants;
    // Add a mapping to track whether an NFT has been rented by a user
    mapping(uint256 => mapping(address => bool)) private hasRented;



    // Event emitted when a user rents an assistant
    event Rent(uint256 nftId, address indexed user);


    constructor()
     ERC721("GPTStore", "GPT")
     {
         dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        devAddress = msg.sender;
     }

    function setAssistants( string memory assistantId, uint256 priceHour ) external {

        // Use Chainlink price feed to set the pricePerHour in Dollar equivalent
        int etherPriceInUSD = getLatestPrice();

        // Calculate the pricePerHour in dollars
        uint256 pricePerHourInUSD = priceHour * uint(etherPriceInUSD);


        assistNo++;
        assistantsGroups[assistNo] = Assistant(assistantId, pricePerHourInUSD, msg.sender);
        assistantIds.push(assistNo); // Add the assistant ID to the array
    }

    /**
     * Returns the latest answer.
     */
    function getLatestPrice() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            uint timeStamp,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        
         require(timeStamp > 0, "Chainlink price feed not available");

        // The price is returned with 8 decimals, so we divide by 1e8
        return int(answer) / 1e8;
    }

    function getAllAssistantDetails() external view returns (Assistant[] memory) {
        Assistant[] memory allAssistants = new Assistant[](assistantIds.length);

        for (uint256 i = 0; i < assistantIds.length; i++) {
            allAssistants[i] = assistantsGroups[assistantIds[i]];
        }

        return allAssistants;
    }

    function removeTemplate(uint256 id) external {
        delete assistantsGroups[id];

        // Find the index of the id in the assistantIds array
        uint256 indexToDelete;
        for (uint256 i = 0; i < assistantIds.length; i++) {
            if (assistantIds[i] == id) {
            indexToDelete = i;
            break;
        }
    }

    // If the id was found in the assistantIds array, remove it using .pop()
    if (indexToDelete < assistantIds.length - 1) {
        assistantIds[indexToDelete] = assistantIds[assistantIds.length - 1];
    }
    assistantIds.pop();
}



    function setMinRentalTime(uint256 time) external  {
        minRentalTime = time;
    }

    function setMaxRentalTime(uint256 time) external  {
        maxRentalTime = time;
    }
    
    
    function setUser(uint256, address, uint64) external pure override {
    revert("cannot change user");
  }

    /// @notice Get the user address of an NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
    /// @return The user address for this NFT
    function userOf(uint256 tokenId) public view virtual returns(address){
        if( uint256(_userInfo[tokenId].expires) >=  block.timestamp){
            return  _userInfo[tokenId].user;
        }
        else{
            return address(0);
        }
    }

    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
    function userExpires(uint256 tokenId) public view virtual returns(uint256){
        return _userInfo[tokenId].expires;
    }

    function rent(string memory metadata, uint256 assistantNo) external payable nonReentrant {
        // Check if the user has already rented this NFT
        require(!hasRented[nftId][msg.sender], "You have already rented this NFT");
        require(assistantsGroups[assistantNo].pricePerHour > 0, "Assistant template not found");
        cleanUpOldRentals();
        uint256 timeRequested = msg.value * 3600 / (assistantsGroups[assistantNo].pricePerHour / 1 ether);
        require(timeRequested >= minRentalTime, "Minimum rental time not met");
        require(timeRequested <= maxRentalTime, "Exceeded maximum rental time");

        // Emit event before state changes
        emit Rent(nftId, msg.sender);

        // Transfer the correct payment to the seller
        payable(assistantsGroups[assistantNo].owner).transfer(msg.value);

        // Mint the NFT
        _mint(msg.sender, nftId);
        _setTokenURI(nftId, metadata);

        // Set user information for the rented NFT
        UserInfo storage info = _userInfo[nftId];
        info.user = msg.sender;
        info.expires = uint64(block.timestamp + timeRequested);
        info.assistantNo = assistantNo;
        info.payment = msg.value; // Store the actual payment
        emit UpdateUser(nftId, info.user, info.expires);

        // Store the rented assistant ID for the user
        userRentedAssistants[msg.sender].push(nftId);

        nftId++;
        // Set the hasRented mapping to true for this NFT and user
        hasRented[nftId][msg.sender] = true;
    }



   function extendRental(uint256 tokenId) external payable nonReentrant {
        require(userOf(tokenId) == msg.sender, "Caller is not owner");
        UserInfo storage user = _userInfo[tokenId];
        Assistant memory template = assistantsGroups[user.assistantNo];
        uint256 timeRequested = msg.value * 3600 / template.pricePerHour;
        require(user.expires + timeRequested < block.timestamp + maxRentalTime, "Max rental time exceeded");

        // Emit event before state changes
        emit Rent(nftId, msg.sender);

        // Transfer the correct payment to the seller
        payable(template.owner).transfer(msg.value);

        // Update user information for the extended rental
        user.expires = uint64(user.expires + timeRequested);
        user.payment += msg.value;
    }

    function stopRental(uint256 tokenId) external nonReentrant {
        require(userOf(tokenId) == msg.sender, "Caller is not owner");
        UserInfo storage user = _userInfo[tokenId];
        Assistant memory template = assistantsGroups[user.assistantNo];
        uint256 secondsLeft = (user.expires - block.timestamp) - 60; // Adjusted subtraction
        require(secondsLeft > 0, "Rental has already expired");

        // Emit event before state changes
        emit Rent(nftId, msg.sender);

        // Calculate the refund to be given to the renter
        uint256 creditsToGive = secondsLeft * template.pricePerHour / 3600;

        // Check contract balance
        require(address(this).balance >= creditsToGive, "Insufficient contract balance");

        // Transfer the correct payment to the renter
        payable(msg.sender).transfer(creditsToGive);

        // Update user information for the stopped rental
        user.payment -= creditsToGive;

        // Burn the NFT
        _burn(tokenId);
    }

    function getUserRentedAssistants() external view returns (UserInfo[] memory) {
        uint256[] storage rentedIds = userRentedAssistants[msg.sender];
        UserInfo[] memory rentedAssistants = new UserInfo[](rentedIds.length);

        for (uint256 i = 0; i < rentedIds.length; i++) {
            rentedAssistants[i] = _userInfo[rentedIds[i]];
        }

        return rentedAssistants;
    }


    function cleanUpOldRentals() public {
        for (uint256 tokenId = 1; tokenId < nftId; tokenId++) {
            if (userOf(tokenId) != address(0) && userExpires(tokenId) < block.timestamp) {
                // NFT has expired, remove it from userRentedAssistants
                removeRentedAssistantFromUser(tokenId);

                // Burn the NFT
                _burn(tokenId);
            }
        }
    }

    function removeRentedAssistantFromUser(uint256 tokenId) internal {
        address user = userOf(tokenId);
        uint256[] storage rentedIds = userRentedAssistants[user];

        // Find the index of the tokenId in the rentedIds array
        uint256 indexToDelete;
        for (uint256 i = 0; i < rentedIds.length; i++) {
            if (rentedIds[i] == tokenId) {
                indexToDelete = i;
                break;
            }
        }

        // If the tokenId was found in the rentedIds array, remove it using .pop()
        if (indexToDelete < rentedIds.length - 1) {
            rentedIds[indexToDelete] = rentedIds[rentedIds.length - 1];
        }
        rentedIds.pop();
    }



    /// @dev See {IERC165-supportsInterface}.
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

   
}
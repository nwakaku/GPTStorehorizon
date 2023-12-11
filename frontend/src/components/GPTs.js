import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useRouter } from "next/navigation";
import { readContract, writeContract, getAccount  } from '@wagmi/core'
import { useContract } from "../app/ContractContext";
import { parseEther } from 'viem'
import { useFetchData } from "./hooks/useFetchData";



const SuccessfulRented = () => (
  <div className="text-white text-center p-4 bg-green-500 rounded-md">
    Successfully Rented! Redirecting...
  </div>
);




const GPTCard = ({ item, onRentSuccess, index }) => {
  const [loading, setLoading] = useState(false);
  const { contractAbi, contractAddress, contract } = useContract();
  const { assistantID, owner, pricePerHour } = item;


  const cardData = useFetchData(assistantID);

  const [isRented, setIsRented] = useState(false);
  const [price, setPrice] = useState('');

  const handleInputChange = (e) => {
    setPrice(e.target.value);
  };

  const handleRentClick = async () => {
      console.log(index+1);

    try {
      // Assuming writeContract is the correct function for sending transactions
      const { hash } = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'rent',
        value: parseEther(price), // You may need to adjust this depending on your contract requirements
        args: [index + 1],
      });

      // Transaction was successful
      if (hash) {
        setIsRented(true);
        onRentSuccess();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error sending rent transaction:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  return (
    <Card className="m-10 w-72 bg-slate-900 flex flex-col rounded-lg border-none">
      <CardHeader className="bg-slate-700 rounded-lg m-4 flex items-center justify-center text-center">
        <img
          src={`https://ipfs.io/ipfs/${cardData.image}`}
          alt={cardData.name}
          className="w-36 h-36 object-cover rounded-md"
        />
      </CardHeader>

      <CardContent className="text-center">
        <div className=" flex justify-between items-center mb-2">
          <CardTitle className="text-center text-white text-sm font-semibold ">
            {cardData.name}
          </CardTitle>
          <CardTitle className="text-center text-[#FFD700] text-sm ">
          ${cardData.priceHour} p/hr
          </CardTitle>
        </div>

        <CardDescription className="text-center text-slate-500 text-base font-normal mb-4">
          {cardData.description}
        </CardDescription>

        <div className=" flex items-center justify-between mx-3">
          <Input
            type="text"
            name="price"
            className=" mr-3 border rounded-md focus:outline-none focus:border-violet-400 text-white"
            placeholder="Enter amount"
            value={price} 
            onChange={handleInputChange}
            required
          />
          <Select>
            <SelectTrigger className="w-18 text-white">
              <SelectValue placeholder="USD" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="usd">USD</SelectItem>
                <SelectItem value="link">EUR</SelectItem>
                <SelectItem value="dollar">XRP</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="">
        <button
            onClick={handleRentClick}
            className={`${
              loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-800'
            } text-white text-md font-semibold rounded-lg py-2 px-24 mt-4`}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Rent'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const GPTs = () => {
  const { contractAbi, contractAddress, contract } = useContract();
  const [cid, setCid] = useState();
  const account = getAccount();

  
  useEffect(() => {
    // Reading from Contracts
    const fetchResults = async () => {
      const results = await readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getAllAssistantDetails",
        account,
      });
      // returns an array of results
      setCid(results);
      console.log(results);
    };

    fetchResults()

  }, []);
  

  const [isRented, setIsRented] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (isRented) {
      const redirectTimer = setTimeout(() => {
        router.push("/dashboard");
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [isRented]);

  const handleRentSuccess = () => {
    setIsRented(true);
  };

  return (
    <div className="flex justify-center p-10">
      {isRented ? (
        <SuccessfulRented />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {cid && cid.map((item, index) => (
            <GPTCard
              key={index}
              item={item} 
              index = {index}
              onRentSuccess={handleRentSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GPTs;
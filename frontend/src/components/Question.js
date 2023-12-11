import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useFetchData } from "./hooks/useFetchData";
import { LucideBadgeX, TimerReset } from "lucide-react";
import Timer from "./Timer";
import { useRouter } from "next/router";
import { useContract } from "../app/ContractContext";
import { useENS } from "./Search"; // Import useENS from your Search component

const Question = () => {
  const searchParams = useSearchParams();

  const URI = searchParams.get("uri");
  const TokenId = searchParams.get("assistNo");

  const { name, image, match, description, priceHour, assistantID } =
    useFetchData(URI);
  const { contractAbi, contractAddress, contract } = useContract();
  const { names, image: ensImage, resolveENS, resetENS } = useENS(); // Use the useENS hook

  const [formData, setFormData] = useState({
    question: "",
  });
  const [answer, setAnswer] = useState("");

  const StopRentalClick = async () => {
    try {
      // Assuming writeContract is the correct function for sending transactions
      const { hash } = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "stopRental",
        args: [TokenId],
      });

      // Transaction was successful
      if (hash) {
        const router = useRouter();
        router.push("/dashboard");
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error sending rent transaction:", error);
    }
  };


  const extendRentalClick = async () => {
    try {
      // Assuming writeContract is the correct function for sending transactions
      const { hash } = await writeContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "extendRental",
        value: parseEther(price), // You may need to adjust this depending on your contract requirements
        args: [TokenId],
      });

      // Transaction was successful
      if (hash) {
        onRentSuccess();
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Error sending rent transaction:", error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    resetENS();
  };

  const handleExampleClick = (exampleQuestion) => {
    setFormData({
      question: exampleQuestion,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (/^0x[a-fA-F0-9]{40}$/.test(formData.question)) {
        await resolveENS(formData.question);
      } else {

        const response = await fetch(
          `http://localhost:5000/question?ask=${formData.question}&assistantId=${assistantID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to submit form");
        }

        const data3 = await response.json();

        setAnswer(data3);
        console.log("Form submitted successfully");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-row bg-black bg-opacity-70">
      {/* Left Portion (1/3 of the screen) */}
      <div className="flex-none w-1/4 p-8 bg-slate-900 rounded-lg my-5 ml-5">
        {/* Content for the left portion goes here */}
        <div className="text-center">
          <img
            src={`https://ipfs.io/ipfs/${image}`} // Use a placeholder image if image is not available
            alt="alt"
            className="w-20 h-20 object-cover rounded-md mx-auto"
          />
          <div className="text-slate-400 font-bold text-sm p-2 mt-2">
            {description}
          </div>
        </div>
        <div className="text-center">
          <p className="text-1xl font-bold text-sm mt-5 ">Example questions</p>

          <div
            className="cursor-pointer bg-black text-white font-semibold text-sm p-2 rounded-lg mt-5"
            onClick={() =>
              handleExampleClick(
                "How to integrate Chainlink VRF (Verifiable Random Function) in my smart contract?"
              )
            }
          >
            How to integrate Chainlink VRF in my smart contract?
          </div>
          <div
            className="cursor-pointer bg-black text-white font-semibold text-sm p-2 rounded-lg mt-5"
            onClick={() =>
              handleExampleClick(
                "What are the key features and advantages of using Avalanche blockchain?"
              )
            }
          >
            Key features and advantages of Avalanche blockchain?
          </div>
          <div
            className="cursor-pointer bg-black text-white font-semibold text-sm p-2 rounded-lg mt-5"
            onClick={() =>
              handleExampleClick(
                "How to deploy a smart contract on the Polygon (Matic) network?"
              )
            }
          >
            How to deploy a smart contract on the Polygon network?
          </div>
          <div
            className="cursor-pointer bg-black text-white font-semibold text-sm p-2 rounded-lg mt-5"
            onClick={() =>
              handleExampleClick(
                "I'm new to chainlink CCIP, how do i get started building with it?"
              )
            }
          >
            I'm new to chainlink CCIP, how do i get started building with it?
          </div>
        </div>

        <div className="mt-14 ml-2 flex items-center text-slate-200 font-bold text-1xl p-4 rounded-lg">
          Rented time:{" "}
          <span className="ml-2">
            <Timer time={10000} />
          </span>
        </div>

        <div className="flex flex-row items-center justify-evenly">
          <Button
            size="lg"
            variant="outline"
            className="cursor-pointer bg-green-600 mr-2 hover:bg-green-800 hover:text-white text-white font-semibold text-md p-3 rounded-lg "
            onClick={extendRentalClick}
          >
            <TimerReset className="h-5 w-5" /> Extend rent
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="cursor-pointer ml-2 bg-red-600 hover:bg-red-800 hover:text-white text-white font-semibold text-md p-3 rounded-lg "
            onClick={StopRentalClick}
          >
            <LucideBadgeX className="h-5 w-5" /> Cancel rent
          </Button>
        </div>
      </div>

      {/* Right Portion (2/3 of the screen) */}
      <div className="flex-grow bg-slate-900 rounded-lg mx-5 my-5">
        {/* Content for the right portion goes here */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img
              src={`https://ipfs.io/ipfs/${image}`}
              className="h-8"
              alt="God help Us"
            />
            <span className="self-center text-slate-400 text-1xl font-semibold whitespace-nowrap dark:text-white">
              {name || "No name available"}
            </span>
          </div>
          <p className="text-slate-400 text-sm mr-5">Clear chat</p>
        </div>

        <Separator className="bg-slate-400" />

        <div className="rounded-lg mx-3 mt-5 bg-black text-right font-inter text-sm font-semibold py-6 px-5">
          {formData.question}
        </div>

        <div className="rounded-lg m-3 bg-black overflow-y-auto h-80 max-h-600 p-8 font-inter text-sm font-semibold leading-6 break-words whitespace-pre-wrap">
          {answer && (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <img
                src={`https://ipfs.io/ipfs/${image}`}
                className="h-8"
                alt="God help Us"
              />
              <span>{answer}</span>
            </div>
          )}
          {names && (
            <div className="mt-10 text-center">
              <div className="w-28 h-30 mt-2 mx-auto">
                {ensImage && (
                  <img
                    src={ensImage}
                    alt="Avatar"
                    className="w-full h-full rounded-full"
                  />
                )}
              </div>
              <p className="text-slate-200 mt-5 font-semibold">
                Here's the ENS name tied to the address: {names}
              </p>
            </div>
          )}
        </div>

        <div className="mt-20 mx-auto flex w-full max-w-4xl items-center space-x-2 justify-center">
          <Input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="mt-1 p-5 border rounded-md focus:outline-none focus:border-violet-400 bg-black border-none"
            placeholder="Ask me anything..."
            required
          />
          <Button
            className="rounded-md bg-violet-800 hover:bg-violet-950"
            onClick={handleSubmit}
            type="submit"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Question;

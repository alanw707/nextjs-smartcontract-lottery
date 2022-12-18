import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { BigNumber, ethers, ContractTransaction } from "ethers"
import React, { useEffect, useState } from "react"
import { useNotification, Bell } from "web3uikit"

export default function LotteryEntrance() {
   const contractAddressObj: { [key: string]: any } = contractAddresses
   const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
   const chainId: string = parseInt(chainIdHex!).toString()
   const raffleAddress = chainId in contractAddressObj ? contractAddressObj[chainId][0] : null
   const [entranceFee, setEntranceFee] = useState("0") //starting value = 0
   const [numberOfPlayers, setNumPlayers] = useState("0")
   const [recentWinner, setRecentWinner] = useState("0")
   const dispatch = useNotification()

   const {
      runContractFunction: enterRaffle,
      isLoading,
      isFetching,
   } = useWeb3Contract({
      abi: JSON.parse(abi),
      contractAddress: raffleAddress,
      functionName: "enterRaffle",
      params: {},
      msgValue: entranceFee,
   })

   const { runContractFunction: getEntranceFee } = useWeb3Contract({
      abi: JSON.parse(abi),
      contractAddress: raffleAddress!, // specify the networkId
      functionName: "getEntranceFee",
      params: {},
   })

   const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
      abi: JSON.parse(abi),
      contractAddress: raffleAddress!,
      functionName: "getNumberOfPlayers",
      params: {},
   })

   const { runContractFunction: getRecentWinner } = useWeb3Contract({
      abi: JSON.parse(abi),
      contractAddress: raffleAddress!,
      functionName: "getRecentWinner",
      params: {},
   })

   useEffect(() => {
      if (isWeb3Enabled) {
         updateUI()
      }
   }, [isWeb3Enabled])

   async function updateUI() {
      const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString()
      const numberOfPlayers = ((await getNumberOfPlayers()) as BigNumber).toString()
      const recentWinnerFromCall = (await getRecentWinner()) as string
      setEntranceFee(entranceFeeFromCall)
      setNumPlayers(numberOfPlayers.toString())
      console.log(recentWinnerFromCall)
      setRecentWinner(recentWinnerFromCall)
   }
   const handleSuccess = async (tx: ContractTransaction) => {
      await tx.wait(1)
      handleNewNotification()
      updateUI()
   }
   const handleNewNotification = () => {
      dispatch({
         type: "info",
         message: "Transaction Complete!",
         title: "Tx Notification",
         icon: <Bell fontSize={20} />,
         position: "topR",
      })
   }

   return (
      <div className="p-5">
         Hi from lottery entrance!
         {raffleAddress ? (
            <div className="">
               <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                  onClick={async function () {
                     await enterRaffle({
                        onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
                        onError: (err) => console.log(err),
                     })
                  }}
                  disabled={isLoading || isFetching}
               >
                  {isLoading || isFetching ? (
                     <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                  ) : (
                     <div>Enter Raffle</div>
                  )}
               </button>
               <div>Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
               <div>Number of players: {numberOfPlayers}</div>
               <div>Recent Winner:{recentWinner}</div>
            </div>
         ) : (
            <div>No Raffle Address Deteched</div>
         )}
      </div>
   )
}

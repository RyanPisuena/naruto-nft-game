
// For importing th ABI file
import myEpicGame from './utils/MyEpicGame.json';

// Importing the address for the deployed contracted
import { CONTRACT_ADDRESS, transformCharacterData } from './constants'

// Bringing in Ethers so we can interact with the deployed contract
import { ethers } from 'ethers';

// React related imports
import React, { useEffect, useState } from 'react';
import './App.css';

import Arena from './Components/Arena';
import SelectCharacter from './Components/SelectCharacter';
import LoadingIndicator from './Components/LoadingIndicator';


import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// App component and related functions
const App = () => {
  // Account states
  const [currentAccount, setCurrentAccount] = useState(null);
  // Character states
  const [characterNFT, setCharacterNFT] = useState(null);
  //Loading states
  const [isLoading, setIsLoading] = useState(false);

  // Checks to see if the Metamask wallet is connected
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        /*
         * We set isLoading here because we use return in the next line
         */
        setIsLoading(false);
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };


  // Method for rendering content
  const renderContent = () => {

    if (isLoading) {
      return <LoadingIndicator />;
    }

    // If user has has not connected to your app - Show Connect To Wallet Button
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img src="https://media.giphy.com/media/bKDPrNojOoeu4/giphy.gif"
            alt="Team 7 Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}>
            Connect Wallet To Get Started
            </button>
        </div>
      );
    }

    //If user has connected to your app AND does not have a character NFT - Show SelectCharacter Component   
    else if (currentAccount && !characterNFT) {
      return <SelectCharacter />;
    } else if (currentAccount && characterNFT) {
      <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />

    }
  };

  // Connects wallet
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();

    const checkNetwork = async () => {
      try {
        if (window.ethereum.networkVersion !== '4') {
          alert("Please connect to Rinkeby!")
        }
      } catch (error) {
        console.log(error)
      }
    }

  }, []);

  useEffect(() => {
    /*
     * The function we will call that interacts with our smart contract
     */
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      // What we use to talk to the Ethereum nodes
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Abstracting an eth account to sign the game transaction
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(characterNFT));
      } else {
        console.log('No character NFT found');
      }
    };

    setIsLoading(false);

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">??????? Team 7 Game ???????</p>
          <p className="sub-text"> Naruto Turn Based Adventure</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
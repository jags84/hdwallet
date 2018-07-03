$( document ).ready(function() {
  // Init
  var web3 = new Web3();
  var global_keystore;

  // New Wallet
  $('#new-wallet-button').on('click', function(){
    newWallet()
  })
  
  function setWeb3Provider(keystore) {
    var web3Provider = new HookedWeb3Provider({
      host: "https://rinkeby.infura.io/",
      transaction_signer: keystore
    });

    web3.setProvider(web3Provider);
  }

  function newAddresses(password) {
    if (password == '') {
      password = prompt('Enter password to retrieve addresses', 'Password');
    }

    var numAddr = parseInt(document.getElementById('numAddr').value)
    global_keystore.keyFromPassword(password, function(err, pwDerivedKey) {
      global_keystore.generateNewAddress(pwDerivedKey, numAddr);
      var addresses = global_keystore.getAddresses();
      for (var i=0; i<addresses.length; ++i) {
        document.getElementById('sendFrom').innerHTML += '<option value="' + addresses[i] + '">' + addresses[i] + '</option>'
      }
    })
  }

  function setSeed() {
    var password = prompt('Enter Password to encrypt your seed', 'Password');
    lightwallet.keystore.createVault({
      password: password,
      seedPhrase: document.getElementById('seed').value,
      //random salt 
      hdPathString: "m/0'/0'/0'"
      }, function (err, ks) {
      global_keystore = ks
      document.getElementById('seed').value = ''
      newAddresses(password);
      setWeb3Provider(global_keystore);
      getBalances();
    })
  }

  function newWallet() {
    var extraEntropy = document.getElementById('userEntropy').value;
    document.getElementById('userEntropy').value = '';
    var randomSeed = lightwallet.keystore.generateRandomSeed(extraEntropy);

    var infoString = 'Your new wallet seed is: "' + randomSeed + 
      '". Please write it down on paper or in a password manager, you will need it to access your wallet. Do not let anyone see this seed or they can take your Ether. ' +
      'Please enter a password to encrypt your seed while in the browser.'
    var password = prompt(infoString, 'Password');


  lightwallet.keystore.createVault({
    password: password,
    seedPhrase: randomSeed,
    //random salt 
    hdPathString: "m/44'/60'/0'/0" //"m/0'/0'/0'" 
  }, function (err, ks) {

    global_keystore = ks
            
    newAddresses(password);
    setWeb3Provider(global_keystore);
    getBalances();
    })
  }
  
  function showSeed() {
    var password = prompt('Enter password to show your seed. Do not let anyone else see your seed.', 'Password');

    global_keystore.keyFromPassword(password, function(err, pwDerivedKey) {
    var seed = global_keystore.getSeed(pwDerivedKey);
    alert('Your seed is: "' + seed + '". Please write it down.');
    });
  }

});
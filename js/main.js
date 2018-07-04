$( document ).ready(function() {
  // Init
  var web3 = new Web3();
  var global_keystore;
  var entropy = 0;

  // New Wallet
  $('#new-wallet-button').on('click', function(){
    newWallet()
  })

  // Restore Wallet
  $('#restore-wallet-button').on('click', function(){
    setSeed()
  })

  // Show Seed
  $('#show-seed-button').on('click', function(){
    showSeed()
  })

  // Generate Entropy
  $('#new-entropy-button').on('click', function(){
    EntropyCollector.start();
    setInterval( calculateEntropy, 300 );
    var mouse_move = 0;
    $( window ).mousemove(function( event ) {
      mouse_move = mouse_move + 1;
      if(mouse_move <= 500){
        $("#entropy-bar").width(mouse_move/5 + "%")
      }else{
        EntropyCollector.stop();
        value = $.md5(entropy)
        $('#userEntropy').val(value)
      }
    });
  })

  function newWallet() {
    var extraEntropy = $('#userEntropy').val();
    $('#userEntropy').val('');
    var randomSeed = lightwallet.keystore.generateRandomSeed(extraEntropy);

    var infoString = 'Your new wallet seed is: "' + randomSeed + 
      '". Please write it down on paper or in a password manager, you will need it to access your wallet. Do not let anyone see this seed or they can take your Ether. ' +
      'Please enter a password to encrypt your seed while in the browser.'
    var password = prompt(infoString, 'Password');


  lightwallet.keystore.createVault({
    password: password,
    seedPhrase: randomSeed,
    hdPathString: "m/44'/60'/0'/0" //"m/0'/0'/0'" 
  }, function (err, ks) {

    global_keystore = ks
            
    newAddresses(password);
    })
  }

  function newAddresses(password) {
    if (password == '') {
      password = prompt('Enter password to retrieve addresses', 'Password');
    }

    var numAddr = parseInt( $('#numAddr').value )
    global_keystore.keyFromPassword(password, function(err, pwDerivedKey) {
      global_keystore.generateNewAddress(pwDerivedKey, numAddr);
      var addresses = global_keystore.getAddresses();
      for (var i=0; i<addresses.length; ++i) {
        $('#sendFrom').append('<option value="' + addresses[i] + '">' + addresses[i] + '</option>')
      }
    })
  }

  function setWeb3Provider(keystore) {
    var web3Provider = new HookedWeb3Provider({
      host: "https://rinkeby.infura.io/",
      transaction_signer: keystore
    });
    web3.setProvider(web3Provider);
  }

  function setSeed() {
    var password = prompt('Enter Password to encrypt your seed', 'Password');
    lightwallet.keystore.createVault({
      password: password,
      seedPhrase: document.getElementById('seed').value,
      //random salt 
      hdPathString: "m/44'/60'/0'/0"
      }, function (err, ks) {
        global_keystore = ks
        document.getElementById('seed').value = ''
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

  function calculateEntropy() {
    var n = EntropyCollector.eventsCaptured,
        e = EntropyCollector.estimatedEntropy;
    entropy = n * e;
  }

});
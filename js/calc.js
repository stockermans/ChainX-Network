  const PCX_MULTIPLIER = 0.00000001;
  const DECIMALS = 2;
  const DAILY_MINTED = 1440000000000;
  let MINING_DISTRIBUTION = 0.576;
  let RESERVED_STAKING;
  const LONG_DECIMALS = 3;
  let DATA;
  let DAILY_YIELD = 1;
  let YEARLY_YIELD = 1;
  let PRICE = 1;

  function stakingRender(){

    var q = function(key){ return document.querySelector(key);};
    var daily = q("#dailyEarning");
    var monthly = q("#monthlyEarning");
    var yearly = q("#yearlyEarning");
    var priceTd =q("#priceTd");
    var dailyUsd = q("#dailyUsd");
    var monthlyUsd = q("#monthlyUsd");
    var yearlyUsd = q("#yearlyUsd");
    var stakingAmount = q("#stakingAmount");

    var renew = function(){
        daily.innerHTML = (DAILY_YIELD * stakingAmount.value).toFixed(DECIMALS) + " PCX";
        monthly.innerHTML = (DAILY_YIELD * 30 * stakingAmount.value).toFixed(DECIMALS) + " PCX";
        yearly.innerHTML = (YEARLY_YIELD * stakingAmount.value).toFixed(DECIMALS) + " PCX";
        priceTd.innerHTML = PRICE + " USD/PCX";
        dailyUsd.innerHTML = (PRICE*(DAILY_YIELD*stakingAmount.value)).toFixed(DECIMALS) + " USD";
        monthlyUsd.innerHTML = (PRICE*DAILY_YIELD*30*stakingAmount.value).toFixed(DECIMALS) + " USD";
        yearlyUsd.innerHTML = (PRICE*YEARLY_YIELD*stakingAmount.value).toFixed(DECIMALS) + " USD";
    };
    
    renew();

  }

  function earningRender(){

    var q = function(key){ return document.querySelector(key);};
    var stakingAmount = q("#stakingAmount");

    stakingRender();
    
    stakingAmount.addEventListener("input", function(){
        stakingRender();
    });

  }
  
  function setMiningDistribution(){
    var distroRange = document.querySelector("#miningDistribution");
    var miningDistroTd = document.querySelector("#miningDistroTd");
    distroRange.value = MINING_DISTRIBUTION*100;
    miningDistroTd.innerHTML = (MINING_DISTRIBUTION*100).toFixed(2) + "%";


    distroRange.oninput = function() {
      MINING_DISTRIBUTION = distroRange.value/100;
      miningDistroTd.innerHTML = (MINING_DISTRIBUTION*100).toFixed(2) + "%";
      getCalculator();
    };

  }
  function setReservedStaking(){
    var reservedRange = document.querySelector("#reservedStakingRange");
    var reservedStakingTd = document.querySelector("#reservedStakingTd");
    var dataChainX = DATA.result.data[0];
    var totalPCX = dataChainX.details.Free + dataChainX.details.ReservedCurrency + dataChainX.details.ReservedDexFuture + dataChainX.details.ReservedDexSpot + dataChainX.details.ReservedStaking + dataChainX.details.ReservedStakingRevocation;
    RESERVED_STAKING = DATA.result.data[0].details.ReservedStaking;
    reservedRange.value = (RESERVED_STAKING/totalPCX)*100;
    reservedStakingTd.innerHTML = (RESERVED_STAKING/totalPCX*100).toFixed(DECIMALS) + "%";


    reservedRange.oninput = function() {
      RESERVED_STAKING = reservedRange.value/100*totalPCX;
      reservedStakingTd.innerHTML = (RESERVED_STAKING/totalPCX*100).toFixed(DECIMALS) + "%";
      getCalculator();
    };

  }
  function getCalculator(){
      var dataChainX = DATA.result.data[0];
      var totalPCX = dataChainX.details.Free + dataChainX.details.ReservedCurrency + dataChainX.details.ReservedDexFuture + dataChainX.details.ReservedDexSpot + dataChainX.details.ReservedStaking + dataChainX.details.ReservedStakingRevocation;
      var firstTime = true;
      var formulaCounting = 1;
      var savedDaily = 1;
        for (k=1; k < 366; k++){
           var bottomMintedDivisor = (totalPCX + DAILY_MINTED * k);
            var reservedStakingDivisor = RESERVED_STAKING / totalPCX;

            var allBottomDivisor = bottomMintedDivisor * reservedStakingDivisor;
            var multiplierBlock = DAILY_MINTED / allBottomDivisor;
            var fullBlock = MINING_DISTRIBUTION * multiplierBlock;

            formula = 1 + (fullBlock * 0.9);
            formulaCounting = formulaCounting * formula;
            if (firstTime){ firstTime = false; savedDaily = formulaCounting;}
        }
        formulaCounting = (formulaCounting - 1) * 100;
        buildResultTable(savedDaily, formulaCounting);
  }

  function buildResultTable(daily, yearly){
      DAILY_YIELD = (daily-1);
      YEARLY_YIELD = yearly/100;
      stakingRender();
      document.querySelector("#dailyTd").innerHTML = ((daily - 1)*100).toFixed(LONG_DECIMALS) + "%";
      document.querySelector("#yearlyTd").innerHTML = (yearly).toFixed(LONG_DECIMALS) + "%";
  }

  function loadingHide(){
      document.querySelector("#loading").style.display = "none";
      document.querySelector("#content").style.display = "";
  }

  function buildTable(){
      var dataChainX = DATA.result.data[0];
      var totalPCX = dataChainX.details.Free + dataChainX.details.ReservedCurrency + dataChainX.details.ReservedDexFuture + dataChainX.details.ReservedDexSpot + dataChainX.details.ReservedStaking + dataChainX.details.ReservedStakingRevocation;
  	  var builder = '<td>'+(totalPCX*PCX_MULTIPLIER)+' PCX</td><td>' + (dataChainX.details.ReservedStaking * PCX_MULTIPLIER).toFixed(0) + ' PCX</td>';
          builder +=  '<td>' + (dataChainX.details.ReservedDexSpot * PCX_MULTIPLIER).toFixed(0) + ' PCX</td>';
          builder += '<td>' + (dataChainX.details.Free * PCX_MULTIPLIER).toFixed(0) + ' PCX</td>';
      document.querySelector("#tableDataChainX").innerHTML = builder;
  }

  function getData(){
      var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({"id":1,"jsonrpc":"2.0","method":"chainx_getAssets","params":[0,200]});

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      fetch("http://w1.chainx.org.cn:8086", requestOptions)
        .then(response => response.text())
        .then(result => {
          loadingHide();
          DATA = JSON.parse(result);
          setMiningDistribution();
          setReservedStaking();
          buildTable();
          getCalculator();
          earningRender();
          getPrices();
        })
        .catch(error => console.log('error', error));
  }
  function getPrices(){
      var myHeaders = new Headers();
          myHeaders.append("Content-Type", "application/json");

      var requestOptions = {
          method: 'GET',
      };

      fetch("https://api.coingecko.com/api/v3/simple/price?ids=chainx&vs_currencies=usd", requestOptions)
        .then(response => response.text())
        .then(result => {
          PRICE = JSON.parse(result).chainx.usd;
          earningRender();
        })
        .catch(error => console.log('error', error));
  }
  
  getData();
$(document).ready(function() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
  });
  var biljettnr = parseInt(params.biljettnr);
  var riktning = params.riktning;
  var antalvuxna = 1;
  var antalbarn = 0;
  var antalrabatt = 0;
  var tor = true;
  var destelts = [];
  var destination = 0;
  // Counter elements
  const biljettdec = $("#biljettnr > .counter > .minus");
  const biljettinc = $("#biljettnr > .counter > .plus");
  const biljettval = $("#biljettnr > .counter > div > .countval");
  const vuxdec = $("#vuxna > .counter > .minus");
  const vuxinc = $("#vuxna > .counter > .plus");
  const vuxval = $("#vuxna > .counter > div > .countval");
  const barndec = $("#barn > .counter > .minus");
  const barninc = $("#barn > .counter > .plus");
  const barnval = $("#barn > .counter > div > .countval");
  const rabattdec = $("#rabatter > .counter > .minus");
  const rabattinc = $("#rabatter > .counter > .plus");
  const rabattval = $("#rabatter > .counter > div > .countval");
  // Reset och riktning
  const resetbtn = $("#reset");
  const riktningbtn = $("#direction");
  // Enkel/ToR
  const enkelbtn = $("#enkel");
  const torbtn = $("#tor");
  // Destinationslista
  const destlistdiv = $("#destlist");
  // Origin
  var origin = parseInt(params.origin);
  // Summering/QR knapp
  const qrbutton = $("#aktiveraqr > button");

  const origdec = $("#fromselector > .minus");
  const originc = $("#fromselector > .plus");
  const origelt = $("#fromselector > div > .countval");

  const summarylist = $("#summarylist");
  const swishqr = $("#swishqr");

  // Nästa knapp
  const nextbtn = $("#next > button");

  const priservuxen = [70, 100, 110, 120];
  const priserbarn = [35, 50, 55, 60];

  const stoplist = [
    "Uppsala Ö",
    "Fyrislund",
    "Årsta",
    "Skölsta",
    "Bärby",
    "Gunsta",
    "Marielund",
    "Lövstahagen",
    "Slä/Fjällnora",
    "Löt",
    "Länna",
    "Almunge",
    "Moga",
    "Faringe"
  ];

  var clickfuncs = [];

  function setDestination(destnum) {
    destelts.forEach(function(stopelt) {
      stopelt.removeClass("chosen");
    });
    destelts[destnum].addClass("chosen");
    destination = destnum;
  }

  function setOrigin(orignum) {
    console.log("Setting Origin", orignum);
    if (orignum >= 0 && orignum <= 13) {
      origin = orignum;
      origelt.text(stoplist[orignum]);
    }

    if(riktning === "faringe" &&
       origin >= destination &&
       destination !== 13) {
      setDestination(origin + 1);
    } else if (riktning === "uppsala" &&
               origin <= destination &&
               destination !== 0) {
      setDestination(origin - 1);
    }

    setUrlState();
  }

  const zonelist = [
    [1],
    [1],
    [1],
    [1, 2],
    [2],
    [2],
    [2, 3],
    [3],
    [3],
    [3],
    [3],
    [3, 4],
    [4],
    [4]
  ];

  const currentstop = 13;

  function translateZone(znum) {
    switch(znum) {
    case 1:
      return "A";
      break;
    case 2:
      return "B";
      break;
    case 3:
      return "C";
      break;
    default:
      return "D";
    }
  }

  function totalResande() {
    return antalvuxna + antalbarn;
  }
  function checkRabattCount() {
    if (antalrabatt > totalResande()) {
      antalrabatt = totalResande();
      rabattval.text(antalrabatt);
    }
  }

  function setClickFuncs() {
    var funccount = 0;
    destelts.forEach(function(destelt) {
      destelt.click(clickfuncs[funccount]);
      funccount++;
    });
  }

  function setDestinationList() {
    destlistdiv.children().remove();
    var shallowdests = destelts.slice();
    if(riktning === "uppsala") {
      shallowdests.reverse();
      shallowdests.shift();
      shallowdests.forEach(function(destelt) {
        destlistdiv.append(destelt);
      });
    } else {
      shallowdests.shift();
      shallowdests.forEach(function(destelt) {
        destlistdiv.append(destelt);
      });
    }
    setClickFuncs();
  }

  function setRiktningUppsala(uppsala) {
    console.log("Setting", uppsala);
    if(!uppsala) {
      riktning = "faringe";
      riktningbtn.text("⇒ Riktning Faringe ⇒");
    } else {
      riktning = "uppsala";
      riktningbtn.text("⇒ Riktning Uppsala ⇒");
    }
    setDestinationList();
    setUrlState();
    setDestination(6);
  }

  function setUrlState() {
    var urlParams = "?riktning=" + riktning;
    urlParams += "&origin=" + origin;
    if (!isNaN(biljettnr)) {
      urlParams += "&biljettnr=" + biljettnr;
    }
    window.history.replaceState(null, null, urlParams);
  }

  function reset() {
    window.location = window.location.pathname;
  }

  // Klick actions för Reset och Riktning
  resetbtn.click(reset);

  riktningbtn.click(function() {
    if(riktning === "faringe") {
      setRiktningUppsala(true);
    } else {
      setRiktningUppsala(false);
    }
  });

  $("#startbutton").click(function() {
    var biljettinput = $("#ticketin").val();
    console.log(biljettinput);
    biljettnr = parseInt(biljettinput);
    if (!isNaN(biljettnr)) {
      $("#initialize").hide();
      $("#flow").show();
      setUrlState();
      biljettval.text(biljettnr);
    }
  });

  // Klick actions för origin
  originc.click(function() {
    if(riktning === "faringe") {
      setOrigin(origin + 1);
    } else {
      setOrigin(origin - 1);
    }
  });

  origdec.click(function() {
    if(riktning === "faringe") {
      setOrigin(origin - 1);
    } else {
      setOrigin(origin + 1);
    }
  });

  // Klick actions för Enkel/ToR
  enkelbtn.click(function() {
    tor = false;
    enkelbtn.addClass("chosen");
    torbtn.removeClass("chosen");
  });

  torbtn.click(function() {
    tor = true;
    torbtn.addClass("chosen");
    enkelbtn.removeClass("chosen");
  });

  // inc/dec actions
  biljettinc.click(function() {
    biljettnr++;
    biljettval.text(biljettnr);
  });
  biljettdec.click(function() {
    if (biljettnr > 0) {
      biljettnr--;
    }
    biljettval.text(biljettnr);
  });

  vuxinc.click(function() {
    antalvuxna++;
    vuxval.text(antalvuxna);
  });
  vuxdec.click(function() {
    if (antalvuxna > 0) {
      antalvuxna--;
      checkRabattCount();
    }
    vuxval.text(antalvuxna);
  });

  barninc.click(function() {
    antalbarn++;
    barnval.text(antalbarn);
  });
  barndec.click(function() {
    if (antalbarn > 0) {
      antalbarn--;
      checkRabattCount();
    }
    barnval.text(antalbarn);
  });

  rabattinc.click(function() {
    if (antalrabatt < antalvuxna + antalbarn)
    antalrabatt++;
    rabattval.text(antalrabatt);
  });
  rabattdec.click(function() {
    if (antalrabatt > 0) {
      antalrabatt--;
    }
    rabattval.text(antalrabatt);
  });

  function numZones() {
    const origzones = zonelist[origin];
    const destzones = zonelist[destination];
    var leastdist = 4;
    origzones.forEach(function(origzone) {
      destzones.forEach(function(destzone) {
        var possibledist = Math.abs(origzone - destzone) + 1;
        if(possibledist < leastdist) {
          leastdist = possibledist;
        }
      });
    });

    return leastdist;
  }

  function calcPrice(zoner) {
    var betalandebarn = antalbarn - antalvuxna*2;
    if (betalandebarn < 0) {
      betalandebarn = 0;
    }
    var vuxensumma = antalvuxna * priservuxen[zoner-1];
    var barnsumma = betalandebarn * priserbarn[zoner-1];
    var summa = vuxensumma + barnsumma - antalrabatt*10;
    if (tor) {
      summa = summa*2;
    }
    return [betalandebarn, summa];
  }

  // Klick action för att visa summering + QR
  qrbutton.click(function() {
    // $("#aktiveraqr").hide();
    const zoner = numZones();
    const [betalandebarn, pris] = calcPrice(zoner);
    summarylist.children().remove();

    summarylist.append("<li>Från " + stoplist[origin] + "</li>");
    summarylist.append("<li>Till " + stoplist[destination] + "</li>");
    summarylist.append("<li>Zoner: " + zoner + "</li>");

    if(tor) {
      summarylist.append("<li>ToR</li>");
    } else {
      summarylist.append("<li>Enkel</li>");
    }

    if(antalvuxna > 0) {
      summarylist.append("<li>Vuxna: " + antalvuxna + "</li>");
    }

    if(antalbarn > 0) {
      summarylist.append("<li>Barn (7-15): " + antalbarn + "</li>");
    }

    if(betalandebarn > 0) {
      summarylist.append("<li>Betalande barn: " + betalandebarn + "</li>");
    }

    if(antalvuxna > 0 && antalbarn > 0) {
      summarylist.append("<li>Familj</li>");
    }

    if(antalrabatt > 0) {
      summarylist.append("<li>Rabatt: " + antalrabatt + "</li>");
    }

    summarylist.append("<li>Pris: " + pris + "kr.</li>");
    summarylist.append("<li>Biljettnr: " + biljettnr + "</li>");

    $("#summary").show();
    const buildimg = '<img src="/swishqr?biljettnr=' + biljettnr + '&pris=' + pris + '" alt="Swish QR"/>';
    console.log(buildimg);
    swishqr.children().remove();
    swishqr.append(buildimg);
    nextbtn.show();

    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
  });

  nextbtn.click(function() {
    // Partial reset
    $("html, body").animate({ scrollTop: 0}, 1000);
    swishqr.children().remove();
    summarylist.children().remove();
    antalvuxna = 1;
    vuxval.text(antalvuxna);
    antalbarn = 0;
    barnval.text(antalbarn);
    antalrabatt = 0;
    rabattval.text(antalrabatt);
    tor = true;
    biljettnr++;
    biljettval.text(biljettnr);
    torbtn.addClass("chosen");
    enkelbtn.removeClass("chosen");
  });

  function setupState() {
    if (isNaN(origin) ||
        origin > 13 ||
        origin < 0) {
      origin = 13;
    }

    // Setup destination elements
    var setupcount = 0;
    stoplist.forEach(function(stop) {
      var newelt = $("<button>" + stop + "</button>");
      const stopnum = setupcount;
      console.log(stopnum);
      clickfuncs.push(function() {
        setDestination(stopnum);
        console.log("Destination set to", destination);
      });
      destelts.push(newelt);
      setupcount++;
    });

    // Kolla upp riktning parameter
    if (riktning === "faringe") {
      setRiktningUppsala(false);
    } else {
      setRiktningUppsala(true);
    }

    setOrigin(origin);

    // Hide summary
    $("#summary").hide();
    // Hide next button
    nextbtn.hide();
    // Kolla upp biljettnr parameter
    if (isNaN(biljettnr)) {
      $("#flow").hide();
      $("#initialize").show();
    } else {
      $("#initialize").hide();
      $("#flow").show();
      biljettval.text(biljettnr);
    }

    // Sätt destinationer
    setDestinationList();
  }

  setupState();
});

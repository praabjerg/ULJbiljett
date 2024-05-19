$(document).ready(function() {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
  });
  var biljettnr = parseInt(params.biljettnr);
  var antalvuxna = 1;
  var antalbarn = 0;
  var antalrabatt = 0;
  var tor = true;
  var destelts = [];
  var destination = 6;
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
  // Reset
  const resetbtn = $("#reset");
  // Enkel/ToR
  const enkelbtn = $("#enkel");
  const torbtn = $("#tor");
  // Destinationslista
  const destlistdiv = $("#destlist");
  // Origin
  var origin = parseInt(params.origin);
  // Summering/QR knapp
  const qrbutton = $("#aktiveraqr > button");

  const summarylist = $("#summarylist");
  const qrfield = $("#qrfield");
  const swishqr = $("#swishqr");
  const localqr = $("#localqr");

  // Nästa knapp
  const nextbtn = $("#next > button");

  const priservuxen = [70, 110, 120, 130];
  const priserbarn = [35, 55, 60, 65];

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

  const frombuttons = [];
  const tobuttons = [];

  function setUrlState() {
    var urlParams = "?origin=" + origin;
    if (!isNaN(biljettnr)) {
      urlParams += "&biljettnr=" + biljettnr;
    }
    window.history.replaceState(null, null, urlParams);
  }

  $("#fromcheck > li > input").each(function(index, elt) {
    frombuttons.push(elt);
    elt.addEventListener('change', function() {
      if (this.checked) {
        origin = index;
        setUrlState();
      }
    });
  });

  $("#tocheck > li > input").each(function(index, elt) {
    tobuttons.push(elt);
    elt.addEventListener('change', function() {
      if (this.checked) {
        destination = index;
      }
    });
  });

  function setOrigin(orignum) {
    if (orignum >= 0 && orignum <= 13) {
      origin = orignum;
    }

    // Check origin box
    frombuttons[origin].checked = true;

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

  function reset() {
    window.location = window.location.pathname + "?origin=" + origin;
  }

  // Klick actions för Reset och Riktning
  resetbtn.click(reset);

  $("#startbutton").click(function() {
    var biljettinput = $("#ticketin").val();
    biljettnr = parseInt(biljettinput);
    if (!isNaN(biljettnr)) {
      $("#initialize").hide();
      $("#flow").show();
      setUrlState();
      biljettval.text(biljettnr);
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
    setUrlState();
  });

  biljettdec.click(function() {
    if (biljettnr > 0) {
      biljettnr--;
    }
    biljettval.text(biljettnr);
    setUrlState();
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
    localqr.hide();
    swishqr.hide();
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
    const qrsize = Math.round(0.8 * window.innerWidth);
    localqr.children().remove();
    var qrcode = new QRCode(localqr[0], {
      width: qrsize,
      height: qrsize
    });
    qrcode.makeCode("C1234880530;" + pris + ";" + biljettnr + ";6");
    localqr.show();
    qrfield.show();
    var qrimage = new Image();
    qrimage.src = '/swishqr?biljettnr=' + biljettnr + '&pris=' + pris;
    qrimage.alt = 'Swish QR';
    qrimage.onload = function() {
      localqr.hide();
      swishqr.show();
    };
    swishqr.children().remove();
    swishqr.append(qrimage);
    nextbtn.show();

    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
  });

  nextbtn.click(function() {
    // Partial reset
    $("html, body").animate({ scrollTop: 0}, 1000);
    qrfield.hide();
    swishqr.children().remove();
    swishqr.hide();
    summarylist.children().remove();
    antalvuxna = 1;
    vuxval.text(antalvuxna);
    antalbarn = 0;
    barnval.text(antalbarn);
    antalrabatt = 0;
    rabattval.text(antalrabatt);
    destination = 6;
    tobuttons[destination].checked = true;
    tor = true;
    biljettnr++;
    biljettval.text(biljettnr);
    setUrlState();
    torbtn.addClass("chosen");
    enkelbtn.removeClass("chosen");
    nextbtn.hide();
  });

  function setupState() {
    if (isNaN(origin) ||
        origin > 13 ||
        origin < 0) {
      origin = 13;
    }

    setOrigin(origin);
    tobuttons[destination].checked = true;

    // Hide summary
    $("#summary").hide();
    // Hide next button
    nextbtn.hide();
    // Hide QR elements
    qrfield.hide();
    swishqr.hide();
    localqr.hide();
    // Kolla upp biljettnr parameter
    if (isNaN(biljettnr)) {
      $("#flow").hide();
      $("#initialize").show();
    } else {
      $("#initialize").hide();
      $("#flow").show();
      biljettval.text(biljettnr);
    }
  }

  setupState();
});

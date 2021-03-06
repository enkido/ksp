// Generated by CoffeeScript 1.6.3
(function() {
  var PLOT_HEIGHT, PLOT_WIDTH, PLOT_X_OFFSET, TIC_LENGTH, angleString, canvasContext, clamp, deltaVAbbr, deltaVs, destinationOrbit, distanceString, drawDeltaVScale, drawPlot, durationString, earliestDeparture, finalOrbitalVelocity, hourMinSec, i, initialOrbitalVelocity, kerbalDateString, numberWithCommas, originBody, originOrbit, palette, plotImageData, prepareCanvas, selectedPoint, shortestTimeOfFlight, showTransferDetails, sign, transferType, updateAdvancedControls, worker, xScale, yScale, _i, _j, _k, _l, _m;

  PLOT_WIDTH = 300;

  PLOT_HEIGHT = 300;

  PLOT_X_OFFSET = 70;

  TIC_LENGTH = 5;

  transferType = null;

  originBody = null;

  originOrbit = null;

  destinationOrbit = null;

  initialOrbitalVelocity = null;

  finalOrbitalVelocity = null;

  earliestDeparture = null;

  shortestTimeOfFlight = null;

  xScale = null;

  yScale = null;

  deltaVs = null;

  canvasContext = null;

  plotImageData = null;

  selectedPoint = null;

  palette = [];

  for (i = _i = 64; _i < 69; i = ++_i) {
    palette.push([64, i, 255]);
  }

  for (i = _j = 133; _j <= 255; i = ++_j) {
    palette.push([128, i, 255]);
  }

  for (i = _k = 255; _k >= 128; i = --_k) {
    palette.push([128, 255, i]);
  }

  for (i = _l = 128; _l <= 255; i = ++_l) {
    palette.push([i, 255, 128]);
  }

  for (i = _m = 255; _m >= 128; i = --_m) {
    palette.push([255, i, 128]);
  }

  clamp = function(n, min, max) {
    return Math.max(min, Math.min(n, max));
  };

  sign = function(x) {
    if (x < 0) {
      return -1;
    } else {
      return 1;
    }
  };

  numberWithCommas = function(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  hourMinSec = function(t) {
    var hour, min, sec;
    hour = (t / 3600) | 0;
    t %= 3600;
    min = (t / 60) | 0;
    if (min < 10) {
      min = "0" + min;
    }
    sec = (t % 60).toFixed();
    if (sec < 10) {
      sec = "0" + sec;
    }
    return "" + hour + ":" + min + ":" + sec;
  };

  kerbalDateString = function(t) {
    var day, year;
    year = ((t / (365 * 24 * 3600)) | 0) + 1;
    t %= 365 * 24 * 3600;
    day = ((t / (24 * 3600)) | 0) + 1;
    t %= 24 * 3600;
    return "Year " + year + ", day " + day + " at " + (hourMinSec(t));
  };

  durationString = function(t) {
    var result;
    result = "";
    if (t >= 365 * 24 * 3600) {
      result += (t / (365 * 24 * 3600) | 0) + " years ";
      t %= 365 * 24 * 3600;
      if (t < 24 * 3600) {
        result += "0 days ";
      }
    }
    if (t >= 24 * 3600) {
      result += (t / (24 * 3600) | 0) + " days ";
    }
    t %= 24 * 3600;
    return result + hourMinSec(t);
  };

  distanceString = function(d) {
    if (Math.abs(d) > 1e12) {
      return numberWithCommas((d / 1e9).toFixed()) + " Gm";
    } else if (Math.abs(d) >= 1e9) {
      return numberWithCommas((d / 1e6).toFixed()) + " Mm";
    } else if (Math.abs(d) >= 1e6) {
      return numberWithCommas((d / 1e3).toFixed()) + " km";
    } else {
      return numberWithCommas(d.toFixed()) + " m";
    }
  };

  deltaVAbbr = function(el, dv, prograde, normal) {
    var tooltip;
    tooltip = numberWithCommas(prograde.toFixed(1)) + " m/s prograde; " + numberWithCommas(normal.toFixed(1)) + " m/s normal";
    return el.attr({
      title: tooltip
    }).text(numberWithCommas(dv.toFixed()) + " m/s");
  };

  angleString = function(angle, precision) {
    if (precision == null) {
      precision = 0;
    }
    return (angle * 180 / Math.PI).toFixed(precision) + String.fromCharCode(0x00b0);
  };

  worker = new Worker("javascripts/porkchopworker.js");

  worker.onmessage = function(event) {
    var color, colorIndex, deltaV, j, maxDeltaV, minDeltaV, relativeDeltaV, x, y, _n, _o;
    if ('progress' in event.data) {
      return $('#porkchopProgress').show().find('.bar').width((event.data.progress * 100 | 0) + "%");
    } else if ('deltaVs' in event.data) {
      $('#porkchopProgress').hide().find('.bar').width("0%");
      deltaVs = event.data.deltaVs;
      if (deltaVs instanceof ArrayBuffer) {
        deltaVs = new Float64Array(deltaVs);
      }
      minDeltaV = event.data.minDeltaV;
      maxDeltaV = 4 * minDeltaV;
      selectedPoint = event.data.minDeltaVPoint;
      i = 0;
      j = 0;
      for (y = _n = 0; 0 <= PLOT_HEIGHT ? _n < PLOT_HEIGHT : _n > PLOT_HEIGHT; y = 0 <= PLOT_HEIGHT ? ++_n : --_n) {
        for (x = _o = 0; 0 <= PLOT_WIDTH ? _o < PLOT_WIDTH : _o > PLOT_WIDTH; x = 0 <= PLOT_WIDTH ? ++_o : --_o) {
          deltaV = deltaVs[i++];
          relativeDeltaV = isNaN(deltaV) ? 1.0 : (clamp(deltaV, minDeltaV, maxDeltaV) - minDeltaV) / (maxDeltaV - minDeltaV);
          colorIndex = Math.min(relativeDeltaV * palette.length | 0, palette.length - 1);
          color = palette[colorIndex];
          plotImageData.data[j++] = color[0];
          plotImageData.data[j++] = color[1];
          plotImageData.data[j++] = color[2];
          plotImageData.data[j++] = 255;
        }
      }
      drawDeltaVScale(minDeltaV, maxDeltaV);
      drawPlot();
      showTransferDetails();
      return $('#porkchopSubmit').prop('disabled', false);
    }
  };

  drawDeltaVScale = function(minDeltaV, maxDeltaV) {
    var ctx, _n;
    ctx = canvasContext;
    ctx.save();
    ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'alphabetic';
    for (i = _n = 0; 0.25 > 0 ? _n < 1.0 : _n > 1.0; i = _n += 0.25) {
      ctx.fillText((minDeltaV + i * (maxDeltaV - minDeltaV)).toFixed() + " m/s", PLOT_X_OFFSET + PLOT_WIDTH + 85, (1.0 - i) * PLOT_HEIGHT);
      ctx.textBaseline = 'middle';
    }
    ctx.textBaseline = 'top';
    ctx.fillText(maxDeltaV.toFixed() + " m/s", PLOT_X_OFFSET + PLOT_WIDTH + 85, 0);
    return ctx.restore();
  };

  drawPlot = function(pointer) {
    var ctx, deltaV, tip, x, y;
    if (deltaVs != null) {
      ctx = canvasContext;
      ctx.save();
      ctx.putImageData(plotImageData, PLOT_X_OFFSET, 0);
      ctx.lineWidth = 1;
      if (selectedPoint != null) {
        x = selectedPoint.x;
        y = selectedPoint.y;
        ctx.beginPath();
        if ((pointer != null ? pointer.x : void 0) !== x) {
          ctx.moveTo(PLOT_X_OFFSET + x, 0);
          ctx.lineTo(PLOT_X_OFFSET + x, PLOT_HEIGHT);
        }
        if ((pointer != null ? pointer.y : void 0) !== y) {
          ctx.moveTo(PLOT_X_OFFSET, y);
          ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, y);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.stroke();
      }
      if (pointer != null) {
        x = pointer.x;
        y = pointer.y;
        ctx.beginPath();
        ctx.moveTo(PLOT_X_OFFSET + x, 0);
        ctx.lineTo(PLOT_X_OFFSET + x, PLOT_HEIGHT);
        ctx.moveTo(PLOT_X_OFFSET, y);
        ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.stroke();
        deltaV = deltaVs[(y * PLOT_WIDTH + x) | 0];
        if (!isNaN(deltaV)) {
          tip = " " + String.fromCharCode(0x2206) + "v = " + deltaV.toFixed() + " m/s ";
          ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
          ctx.fillStyle = 'black';
          ctx.textAlign = x < PLOT_WIDTH / 2 ? 'left' : 'right';
          ctx.textBaseline = y > 15 ? 'bottom' : 'top';
          ctx.fillText(tip, x + PLOT_X_OFFSET, y);
        }
      }
      return ctx.restore();
    }
  };

  prepareCanvas = function() {
    var ctx, j, paletteKey, x, y, _n, _o, _p, _q;
    ctx = canvasContext;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(PLOT_X_OFFSET - 1, 0);
    ctx.lineTo(PLOT_X_OFFSET - 1, PLOT_HEIGHT + 1);
    ctx.lineTo(PLOT_X_OFFSET + PLOT_WIDTH, PLOT_HEIGHT + 1);
    ctx.stroke();
    ctx.beginPath();
    for (i = _n = 0; 0.25 > 0 ? _n <= 1.0 : _n >= 1.0; i = _n += 0.25) {
      y = PLOT_HEIGHT * i + 1;
      ctx.moveTo(PLOT_X_OFFSET - 1, y);
      ctx.lineTo(PLOT_X_OFFSET - 1 - TIC_LENGTH, y);
      x = PLOT_X_OFFSET - 1 + PLOT_WIDTH * i;
      ctx.moveTo(x, PLOT_HEIGHT + 1);
      ctx.lineTo(x, PLOT_HEIGHT + 1 + TIC_LENGTH);
    }
    ctx.stroke();
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (i = _o = 0; 0.05 > 0 ? _o <= 1.0 : _o >= 1.0; i = _o += 0.05) {
      if (i % 0.25 === 0) {
        continue;
      }
      y = PLOT_HEIGHT * i + 1;
      ctx.moveTo(PLOT_X_OFFSET - 1, y);
      ctx.lineTo(PLOT_X_OFFSET - 1 - TIC_LENGTH, y);
      x = PLOT_X_OFFSET - 1 + PLOT_WIDTH * i;
      ctx.moveTo(x, PLOT_HEIGHT + 1);
      ctx.lineTo(x, PLOT_HEIGHT + 1 + TIC_LENGTH);
    }
    ctx.stroke();
    ctx.font = 'italic 12pt "Helvetic Neue",Helvetica,Arial,sans serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.fillText("Departure Date (days from epoch)", PLOT_X_OFFSET + PLOT_WIDTH / 2, PLOT_HEIGHT + 40);
    ctx.save();
    ctx.rotate(-Math.PI / 2);
    ctx.textBaseline = 'top';
    ctx.fillText("Time of Flight (days)", -PLOT_HEIGHT / 2, 0);
    ctx.restore();
    paletteKey = ctx.createImageData(20, PLOT_HEIGHT);
    i = 0;
    for (y = _p = 0; 0 <= PLOT_HEIGHT ? _p < PLOT_HEIGHT : _p > PLOT_HEIGHT; y = 0 <= PLOT_HEIGHT ? ++_p : --_p) {
      j = ((PLOT_HEIGHT - y - 1) * palette.length / PLOT_HEIGHT) | 0;
      for (x = _q = 0; _q < 20; x = ++_q) {
        paletteKey.data[i++] = palette[j][0];
        paletteKey.data[i++] = palette[j][1];
        paletteKey.data[i++] = palette[j][2];
        paletteKey.data[i++] = 255;
      }
    }
    ctx.putImageData(paletteKey, PLOT_X_OFFSET + PLOT_WIDTH + 60, 0);
    ctx.fillText(String.fromCharCode(0x2206) + "v", PLOT_X_OFFSET + PLOT_WIDTH + 45, PLOT_HEIGHT / 2);
    return ctx.restore();
  };

  showTransferDetails = function() {
    var ejectionAngle, n0, p0, p1, t0, t1, transfer, trueAnomaly, v0, v1, x, y, _ref;
    if (selectedPoint != null) {
      _ref = [selectedPoint.x, selectedPoint.y], x = _ref[0], y = _ref[1];
      t0 = earliestDeparture + x * xScale / PLOT_WIDTH;
      t1 = t0 + shortestTimeOfFlight + ((PLOT_HEIGHT - 1) - y) * yScale / PLOT_HEIGHT;
      trueAnomaly = originOrbit.trueAnomalyAt(t0);
      p0 = originOrbit.positionAtTrueAnomaly(trueAnomaly);
      v0 = originOrbit.velocityAtTrueAnomaly(trueAnomaly);
      n0 = originOrbit.normalVector();
      trueAnomaly = destinationOrbit.trueAnomalyAt(t1);
      p1 = destinationOrbit.positionAtTrueAnomaly(trueAnomaly);
      v1 = destinationOrbit.velocityAtTrueAnomaly(trueAnomaly);
      transfer = Orbit.transfer(transferType, originOrbit.referenceBody, t0, p0, v0, n0, t1, p1, v1, initialOrbitalVelocity, finalOrbitalVelocity, originBody);
      $('#departureTime').text(kerbalDateString(t0)).attr({
        title: "UT: " + (t0.toFixed()) + "s"
      });
      $('#arrivalTime').text(kerbalDateString(t1)).attr({
        title: "UT: " + (t1.toFixed()) + "s"
      });
      $('#timeOfFlight').text(durationString(t1 - t0)).attr({
        title: (t1 - t0).toFixed() + "s"
      });
      $('#phaseAngle').text(angleString(originOrbit.phaseAngle(destinationOrbit, t0), 2));
      if (transfer.ejectionAngle != null) {
        $('.ejectionAngle').show();
        if (destinationOrbit.semiMajorAxis < originOrbit.semiMajorAxis) {
          ejectionAngle = transfer.ejectionAngle - Math.PI;
          if (ejectionAngle < 0) {
            ejectionAngle += 2 * Math.PI;
          }
          $('#ejectionAngle').text(angleString(ejectionAngle) + " to retrograde");
        } else {
          $('#ejectionAngle').text(angleString(transfer.ejectionAngle) + " to prograde");
        }
      } else {
        $('.ejectionAngle').hide();
      }
      deltaVAbbr($('#ejectionDeltaV'), transfer.ejectionDeltaV, transfer.ejectionProgradeDeltaV, transfer.ejectionNormalDeltaV);
      $('#transferPeriapsis').text(distanceString(transfer.orbit.periapsisAltitude()));
      $('#transferApoapsis').text(distanceString(transfer.orbit.apoapsisAltitude()));
      $('#transferInclination').text(angleString(transfer.orbit.inclination, 2));
      $('#transferAngle').text(angleString(transfer.angle));
      if (transfer.planeChangeTime != null) {
        $('.ballisticTransfer').hide();
        $('.planeChangeTransfer').show();
        $('#planeChangeTime').text(kerbalDateString(transfer.planeChangeTime)).attr({
          title: "UT: " + (transfer.planeChangeTime.toFixed()) + "s"
        });
        $('#planeChangeAngleToIntercept').text(angleString(transfer.planeChangeAngleToIntercept, 2));
        $('#planeChangeAngle').text(angleString(transfer.planeChangeAngle, 2));
        deltaVAbbr($('#planeChangeDeltaV'), transfer.planeChangeDeltaV, -transfer.planeChangeDeltaV * Math.abs(Math.sin(transfer.planeChangeAngle / 2)), transfer.planeChangeDeltaV * sign(transfer.planeChangeAngle) * Math.cos(transfer.planeChangeAngle / 2));
      } else {
        $('.planeChangeTransfer').hide();
        $('.ballisticTransfer').show();
        $('#ejectionInclination').text(angleString(transfer.ejectionInclination, 2));
      }
      if (transfer.insertionInclination != null) {
        $('#insertionInclination').text(angleString(transfer.insertionInclination, 2));
      } else {
        $('#insertionInclination').text("N/A");
      }
      if (transfer.insertionDeltaV !== 0) {
        deltaVAbbr($('#insertionDeltaV'), transfer.insertionDeltaV, -transfer.insertionDeltaV, 0);
      } else {
        $('#insertionDeltaV').attr({
          title: null
        }).text("N/A");
      }
      $('#totalDeltaV').text(numberWithCommas(transfer.deltaV.toFixed()) + " m/s");
      return $('#transferDetails:hidden').fadeIn();
    } else {
      return $('#transferDetails:visible').fadeOut();
    }
  };

  updateAdvancedControls = function() {
    var aerobrake, destination, hohmannTransfer, hohmannTransferTime, maxDays, maxDeparture, minDays, minDeparture, origin, referenceBody, synodicPeriod;
    origin = CelestialBody[$('#originSelect').val()];
    destination = CelestialBody[$('#destinationSelect').val()];
    referenceBody = origin.orbit.referenceBody;
    hohmannTransfer = Orbit.fromApoapsisAndPeriapsis(referenceBody, destination.orbit.semiMajorAxis, origin.orbit.semiMajorAxis, 0, 0, 0, 0);
    hohmannTransferTime = hohmannTransfer.period() / 2;
    synodicPeriod = Math.abs(1 / (1 / destination.orbit.period() - 1 / origin.orbit.period()));
    minDeparture = ($('#earliestDepartureYear').val() - 1) * 365 + ($('#earliestDepartureDay').val() - 1);
    minDeparture *= 24 * 3600;
    maxDeparture = minDeparture + Math.min(2 * synodicPeriod, 2 * origin.orbit.period());
    minDays = Math.max(hohmannTransferTime - destination.orbit.period(), hohmannTransferTime / 2) / 3600 / 24;
    maxDays = minDays + Math.min(2 * destination.orbit.period(), hohmannTransferTime) / 3600 / 24;
    minDays = minDays < 10 ? minDays.toFixed(2) : minDays.toFixed();
    maxDays = maxDays < 10 ? maxDays.toFixed(2) : maxDays.toFixed();
    $('#latestDepartureYear').val((maxDeparture / 3600 / 24 / 365 | 0) + 1);
    $('#latestDepartureDay').val((maxDeparture / 3600 / 24 % 365 | 0) + 1);
    $('#shortestTimeOfFlight').val(minDays);
    $('#longestTimeOfFlight').val(maxDays);
    $('#useAtmoForInsertion').attr("disabled", destination.atmPressure === 0);
    aerobrake = $('#useAtmoForInsertion').is(":checked") && !$('#useAtmoForInsertion').attr("disabled");
    return $('#finalOrbit').attr("disabled", aerobrake);
  };

  this.prepareOrigins = function() {
    var listBody, o;
    o = $('#originSelect');
    o.empty();
    return (listBody = (function(body, elem) {
      var group, k, v, _ref, _results;
      _results = [];
      for (k in CelestialBody) {
        v = CelestialBody[k];
        if (!((v != null ? (_ref = v.orbit) != null ? _ref.referenceBody : void 0 : void 0) === body)) {
          continue;
        }
        group = $('<optgroup>');
        listBody(v, group);
        elem.append($('<option>').text(k));
        if (group.children().size() > 0) {
          group.attr('label', k + '\'s Moons');
          _results.push(elem.append(group));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }))(CelestialBody.Kerbol, o);
  };

  $(document).ready(function() {
    canvasContext = $('#porkchopCanvas')[0].getContext('2d');
    plotImageData = canvasContext.createImageData(PLOT_WIDTH, PLOT_HEIGHT);
    prepareCanvas();
    prepareOrigins();
    $('#porkchopCanvas').mousemove(function(event) {
      var offsetX, offsetY, pointer, x, y, _ref, _ref1;
      if (deltaVs != null) {
        offsetX = ((_ref = event.offsetX) != null ? _ref : event.pageX - $('#porkchopCanvas').offset().left) | 0;
        offsetY = ((_ref1 = event.offsetY) != null ? _ref1 : event.pageY - $('#porkchopCanvas').offset().top) | 0;
        x = offsetX - PLOT_X_OFFSET;
        y = offsetY;
        if (x >= 0 && x < PLOT_WIDTH && y < PLOT_HEIGHT) {
          pointer = {
            x: x,
            y: y
          };
        }
        return drawPlot(pointer);
      }
    });
    $('#porkchopCanvas').mouseleave(function(event) {
      return drawPlot();
    });
    $('#porkchopCanvas').click(function(event) {
      var offsetX, offsetY, x, y, _ref, _ref1;
      if (deltaVs != null) {
        offsetX = ((_ref = event.offsetX) != null ? _ref : event.pageX - $('#porkchopCanvas').offset().left) | 0;
        offsetY = ((_ref1 = event.offsetY) != null ? _ref1 : event.pageY - $('#porkchopCanvas').offset().top) | 0;
        x = offsetX - PLOT_X_OFFSET;
        y = offsetY;
        if (x >= 0 && x < PLOT_WIDTH && y < PLOT_HEIGHT && !isNaN(deltaVs[(y * PLOT_WIDTH + x) | 0])) {
          selectedPoint = {
            x: x,
            y: y
          };
          drawPlot(selectedPoint);
          showTransferDetails();
          return ga('send', 'event', 'porkchop', 'click', "" + x + "," + y);
        }
      }
    });
    $('#originSelect').change(function(event) {
      var k, origin, previousDestination, referenceBody, s, v, _ref;
      origin = CelestialBody[$(this).val()];
      referenceBody = origin.orbit.referenceBody;
      s = $('#destinationSelect');
      previousDestination = s.val();
      s.empty();
      for (k in CelestialBody) {
        v = CelestialBody[k];
        if (v !== origin && (v != null ? (_ref = v.orbit) != null ? _ref.referenceBody : void 0 : void 0) === referenceBody) {
          s.append($('<option>').text(k));
        }
      }
      s.val(previousDestination);
      if (s.val() == null) {
        s.val($('option:first', s).val());
      }
      s.prop('disabled', s[0].childNodes.length === 0);
      return updateAdvancedControls();
    });
    $('#destinationSelect').change(function(event) {
      return updateAdvancedControls();
    });
    $('#originSelect').change();
    $('#destinationSelect').val('Duna');
    $('#destinationSelect').change();
    $('#useAtmoForInsertion').change(function(event) {
      return $('#finalOrbit').attr("disabled", $('#useAtmoForInsertion').is(":checked"));
    });
    $('#showAdvancedControls').click(function(event) {
      var $this;
      $this = $(this);
      if ($this.text().indexOf('Show') !== -1) {
        $this.text('Hide advanced settings...');
        return $('#advancedControls').slideDown();
      } else {
        $(this).text('Show advanced settings...');
        return $('#advancedControls').slideUp();
      }
    });
    $('#earliestDepartureYear,#earliestDepartureDay').change(function(event) {
      if ($('#showAdvancedControls').text().indexOf('Show') !== -1) {
        return updateAdvancedControls();
      } else {
        if (+$('#earliestDepartureYear').val() > +$('#latestDepartureYear').val()) {
          $('#latestDepartureYear').val($('#earliestDepartureYear').val());
        }
        if (+$('#earliestDepartureYear').val() === +$('#latestDepartureYear').val()) {
          if (+$('#earliestDepartureDay').val() >= +$('#latestDepartureDay').val()) {
            return $('#latestDepartureDay').val(+$('#earliestDepartureDay').val() + 1);
          }
        }
      }
    });
    $('#shortestTimeOfFlight,#longestTimeOfFlight').change(function(event) {
      if (+$('#shortestTimeOfFlight').val() <= 0) {
        $('#shortestTimeOfFlight').val(1);
      }
      if (+$('#longestTimeOfFlight').val() <= 0) {
        $('#longestTimeOfFlight').val(2);
      }
      if (+$('#shortestTimeOfFlight').val() >= $('#longestTimeOfFlight').val()) {
        if (this.id === 'shortestTimeOfFlight') {
          return $('#longestTimeOfFlight').val(+$('#shortestTimeOfFlight').val() + 1);
        } else if (+$('#longestTimeOfFlight').val() > 1) {
          return $('#shortestTimeOfFlight').val(+$('#longestTimeOfFlight').val() - 1);
        } else {
          return $('#shortestTimeOfFlight').val(+$('#longestTimeOfFlight').val() / 2);
        }
      }
    });
    $('#porkchopForm').bind('reset', function(event) {
      return setTimeout(function() {
        $('#originSelect').val('Kerbin');
        $('#originSelect').change();
        $('#destinationSelect').val('Duna');
        return $('#destinationSelect').change();
      }, 0);
    });
    return $('#porkchopForm').submit(function(event) {
      var aerobrake, ctx, description, destinationBody, destinationBodyName, finalOrbit, initialOrbit, latestDeparture, originBodyName, scrollTop, _n, _o;
      event.preventDefault();
      $('#porkchopSubmit').prop('disabled', true);
      scrollTop = $('#porkchopCanvas').offset().top + $('#porkchopCanvas').height() - $(window).height();
      if ($(document).scrollTop() < scrollTop) {
        $("html,body").animate({
          scrollTop: scrollTop
        }, 500);
      }
      originBodyName = $('#originSelect').val();
      destinationBodyName = $('#destinationSelect').val();
      initialOrbit = $('#initialOrbit').val().trim();
      finalOrbit = $('#finalOrbit').val().trim();
      transferType = $('#transferTypeSelect').val();
      originBody = CelestialBody[originBodyName];
      destinationBody = CelestialBody[destinationBodyName];
      if (+initialOrbit === 0) {
        initialOrbitalVelocity = 0;
      } else {
        initialOrbitalVelocity = originBody.circularOrbitVelocity(initialOrbit * 1e3);
      }
      aerobrake = $('#useAtmoForInsertion').is(":checked") && !$('#useAtmoForInsertion').attr("disabled");
      if (finalOrbit && !aerobrake) {
        if (+finalOrbit === 0) {
          finalOrbitalVelocity = 0;
        } else {
          finalOrbitalVelocity = destinationBody.circularOrbitVelocity(finalOrbit * 1e3);
        }
      } else {
        finalOrbitalVelocity = null;
      }
      earliestDeparture = ($('#earliestDepartureYear').val() - 1) * 365 + ($('#earliestDepartureDay').val() - 1);
      earliestDeparture *= 24 * 3600;
      latestDeparture = ($('#latestDepartureYear').val() - 1) * 365 + ($('#latestDepartureDay').val() - 1);
      latestDeparture *= 24 * 3600;
      xScale = latestDeparture - earliestDeparture;
      shortestTimeOfFlight = +$('#shortestTimeOfFlight').val() * 24 * 3600;
      yScale = +$('#longestTimeOfFlight').val() * 24 * 3600 - shortestTimeOfFlight;
      originOrbit = originBody.orbit;
      destinationOrbit = destinationBody.orbit;
      ctx = canvasContext;
      ctx.clearRect(PLOT_X_OFFSET, 0, PLOT_WIDTH, PLOT_HEIGHT);
      ctx.clearRect(PLOT_X_OFFSET + PLOT_WIDTH + 85, 0, 65, PLOT_HEIGHT + 10);
      ctx.clearRect(20, 0, PLOT_X_OFFSET - TIC_LENGTH - 21, PLOT_HEIGHT + TIC_LENGTH);
      ctx.clearRect(PLOT_X_OFFSET - 40, PLOT_HEIGHT + TIC_LENGTH, PLOT_WIDTH + 80, 20);
      ctx.font = '10pt "Helvetic Neue",Helvetica,Arial,sans serif';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (i = _n = 0; 0.25 > 0 ? _n <= 1.0 : _n >= 1.0; i = _n += 0.25) {
        if (i === 1.0) {
          ctx.textBaseline = 'top';
        }
        ctx.fillText(((shortestTimeOfFlight + i * yScale) / 3600 / 24) | 0, PLOT_X_OFFSET - TIC_LENGTH - 3, (1.0 - i) * PLOT_HEIGHT);
      }
      ctx.textAlign = 'center';
      for (i = _o = 0; 0.25 > 0 ? _o <= 1.0 : _o >= 1.0; i = _o += 0.25) {
        ctx.fillText(((earliestDeparture + i * xScale) / 3600 / 24) | 0, PLOT_X_OFFSET + i * PLOT_WIDTH, PLOT_HEIGHT + TIC_LENGTH + 3);
      }
      deltaVs = null;
      worker.postMessage({
        transferType: transferType,
        originOrbit: originOrbit,
        destinationOrbit: destinationOrbit,
        initialOrbitalVelocity: initialOrbitalVelocity,
        finalOrbitalVelocity: finalOrbitalVelocity,
        earliestDeparture: earliestDeparture,
        xScale: xScale,
        shortestTimeOfFlight: shortestTimeOfFlight,
        yScale: yScale
      });
      description = "" + originBodyName + " @" + (+initialOrbit) + "km to " + destinationBodyName;
      if (finalOrbit) {
        description += " @" + (+finalOrbit) + "km";
      }
      description += " after day " + (earliestDeparture / (24 * 3600)) + " via " + ($('#transferTypeSelect option:selected').text()) + " transfer";
      return ga('send', 'event', 'porkchop', 'submit', description);
    });
  });

}).call(this);

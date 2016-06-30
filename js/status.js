// Copyright (c) 2016 Walter Bender
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.
//
// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

// Similar to the matrix, this widget makes a mapping between pitch
// and drum sounds.


function StatusMatrix() {
    this.cellWidth = 0;
    this.currentNotes = [];
    this.currentOctaves = [];
    this.currentNoteValues = [];
    docById('statusmatrix').style.visibility = 'hidden';

    this.init = function(logo) {
        // Initializes the status matrix. First removes the
        // previous matrix and them make another one in DOM (document
        // object model)
        this.logo = logo;

        docById('statusmatrix').style.display = 'inline';
        docById('statusmatrix').style.visibility = 'visible';
        docById('statusmatrix').style.border = 2;

        // FIXME: make this number based on canvas size.
        var w = window.innerWidth;
        this.cellScale = w / 1200;
        // docById('statusmatrix').style.width = Math.floor(w / 2) + 'px';
        // docById('statusmatrix').style.height = '300px';
        docById('statusmatrix').style.overflowX = 'auto';

        // Used to remove the matrix table
        Element.prototype.remove = function() {
            this.parentElement.removeChild(this);
        }

        NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
            for (var i = 0, len = this.length; i < len; i++) {
                if (this[i] && this[i].parentElement) {
                    this[i].parentElement.removeChild(this[i]);
                }
            }
        };

        var table = docById('statusTable');

        if (table !== null) {
            table.remove();
        }

        var x = document.createElement('TABLE');
        x.setAttribute('id', 'statusTable');
        x.style.textAlign = 'center';

        var matrixDiv = docById('statusmatrix');
        matrixDiv.style.paddingTop = 0 + 'px';
        matrixDiv.style.paddingLeft = 0 + 'px';
        matrixDiv.appendChild(x);
        matrixDivPosition = matrixDiv.getBoundingClientRect();

        var table = docById('statusTable');
        var header = table.createTHead();
        var row = header.insertRow(0);
        row.style.left = Math.floor(matrixDivPosition.left) + 'px';
        row.style.top = Math.floor(matrixDivPosition.top) + 'px';

        var iconSize = Math.floor(this.cellScale * 24);

        var cell = row.insertCell(-1);
        cell.innerHTML = '&nbsp;&nbsp;<img src="header-icons/close-button.svg" title="' + _('close') + '" alt="' + _('close') + '" height="' + iconSize + '" width="' + iconSize + ' display="block" margin="auto">&nbsp;&nbsp;';
        cell.style.width = Math.floor(MATRIXBUTTONHEIGHT * this.cellScale) + 'px';
        cell.style.minWidth = cell.style.width;
        cell.style.maxWidth = cell.style.width;
        cell.style.height = Math.floor(MATRIXBUTTONHEIGHT * this.cellScale) + 'px';
        cell.style.backgroundColor = MATRIXBUTTONCOLOR;
        cell.onclick=function() {
            docById('statusmatrix').style.visibility = 'hidden';
            docById('statusmatrix').style.border = 0;
        }
        cell.onmouseover=function() {
            this.style.backgroundColor = MATRIXBUTTONCOLORHOVER;
        }
        cell.onmouseout=function() {
            this.style.backgroundColor = MATRIXBUTTONCOLOR;
        }

        // One row per voice (turtle)
        // One column per field
        for (i = 0; i < this.logo.statusFields.length; i++) {
            var cell = row.insertCell(i + 1);
            cell.innerHTML = '&nbsp;<b>' + _(this.logo.statusFields[i]) + '</b>&nbsp;'
            cell.style.height = Math.floor(MATRIXBUTTONHEIGHT * this.cellScale) + 'px';
            cell.style.backgroundColor = MATRIXBUTTONCOLOR;
        }
        var cell = row.insertCell(i + 1);
        cell.innerHTML = '&nbsp;<b>' + _('note') + '</b>&nbsp;'
        cell.style.height = Math.floor(MATRIXBUTTONHEIGHT * this.cellScale) + 'px';
        cell.style.backgroundColor = MATRIXBUTTONCOLOR;
        for (var i = 0; i < this.logo.turtles.turtleList.length; i++) {
            if (this.logo.turtles.turtleList[i].trash) {
                continue;
            }
            var row = header.insertRow(i + 1);
            var cell = row.insertCell(0);
            cell.style.backgroundColor = MATRIXLABELCOLOR;
            cell.style.fontSize = this.cellScale * 100 + '%';

            cell.innerHTML = '&nbsp;&nbsp;<img src="header-icons/turtle-button.svg" title="' + this.logo.turtles.turtleList[i].name + '" alt="' + this.logo.turtles.turtleList[i].name + '" height="' + iconSize + '" width="' + iconSize + ' display="block" margin="auto">&nbsp;&nbsp;'; // + '" vertical-align="middle">&nbsp;&nbsp;';

            cell.style.height = Math.floor(MATRIXSOLFEHEIGHT * this.cellScale) + 'px';

            // + 1 is for the note column
            for (j = 0; j < this.logo.statusFields.length + 1; j++) {
                var cell = row.insertCell(-1);
                cell.style.backgroundColor = MATRIXRHYTHMCELLCOLOR;
                cell.style.fontSize = this.cellScale * 100 + '%';

                cell.innerHTML = '';

                cell.style.height = Math.floor(MATRIXSOLFEHEIGHT * this.cellScale) + 'px';
            }
        }
    };

    this.updateAll = function() {
        // Update status of  all of the voices in the matrix.
        var table = docById('statusTable');
        for (var i = 0; i < this.logo.turtles.turtleList.length; i++) {
            if (this.logo.turtles.turtleList[i].trash) {
                continue;
            }

            for (j = 0; j < this.logo.statusFields.length; j++) {
                var innerHTML = '';
                switch(this.logo.statusFields[j]) {
                case 'bpm':
                    if (this.logo.bpm[i].length > 0) {
                        var bpm = last(this.logo.bpm[i]);
                    } else {
                        var bpm = TARGETBPM;
                    }
                    innerHTML = bpm;
                    break;
                case 'volume':
                    innerHTML = this.logo.polyVolume[i];
                    break;
                case 'key':
                    innerHTML = this.logo.keySignature[i].replace(/ /g, '&nbsp;');
                    break;
                case 'duplicate':
                    innerHTML = this.logo.duplicateFactor[i];
                    break;
                case 'transposition':
                    innerHTML = this.logo.transposition[i];
                    break;
                case 'skip':
                    innerHTML = this.logo.skipFactor[i];
                    break;
                case 'staccato':
                    innerHTML =  last(this.logo.staccato[i]);
                    break;
                case 'slur':
                    innerHTML =  -last(this.logo.staccato[i]);
                    break;
                default:
                    console.log('??? ' + this.logo.statusFields[j]);
                    break;
                }
                var cell = table.rows[i + 1].cells[j + 1];
                if (cell != null) {
                    cell.innerHTML = innerHTML;
                }
            }

            if (this.logo.lastNotePlayed[i] != null) {
                var note = this.logo.lastNotePlayed[i][0];
                var value = this.logo.lastNotePlayed[i][1];
            } else {
                var note = '';
                var value = '';
            }
            var cell = table.rows[i + 1].cells[j + 1];
            if (cell != null) {
                cell.innerHTML = note + ' ' + value;
            }
        }
    };

};
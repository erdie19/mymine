// Constants
const K_TRUE = "true";
const K_FALSE = "false";

var row_count, col_count, mine_count, rest_mine, is_end, is_begin, timer_id, time_count;
var oMainFrame, oLeftBox, oRightBox, oImgFace;

//Expand all the mines when game is over
function ExpandAll() {
	for (var i = 0; i < row_count; i++) {
		for (var j = 0; j < col_count; j++) {
			var oMine = document.getElementById("mine_" + (i * col_count + j));
			switch (parseInt(oMine.getAttribute("mine_value"), 10)) {
				case 9:
					if (oMine.getAttribute("marked") !== K_TRUE) {
						oMine.className = "mine_down";
						var oBomb = document.createElement("img");
						oBomb.style.width = "15px";
						oBomb.style.height = "15px";
						oBomb.style.padding = "0px";
						oBomb.style.margin = "0px";
						oBomb.src = "images/bomb.gif";
						oMine.appendChild(oBomb);
					}
					break;
				default:
					if (oMine.getAttribute("marked") === K_TRUE) {
						oMine.className = "mine_wrong_flag";
						var oError = document.createElement("img");
						oError.style.width = "15px";
						oError.style.height = "15px";
						oError.style.padding = "0px";
						oError.style.margin = "0px";
						oError.src = "images/error.gif";
						oMine.appendChild(oError);
					} else {
						oMine.className = "mine_down";
						oMine.innerText = oMine.getAttribute("mine_value");
					}
					oMine.setAttribute("expanded", true);
					break;
			}
		}
	}
}

//Check if the player win the game
function CheckGameStatus() {
	var is_win = true;
	var accumulate = row_count * col_count;
	if (rest_mine != 0) {
		is_win = false;
	} else {
		for (var i = 0; i < accumulate; i++) {
			var oMine = document.getElementById("mine_" + i);
			if (oMine.getAttribute("expanded") === K_FALSE && oMine.getAttribute("mine_value") != 9) {
				is_win = false;
				break;
			}
		}
	}

	if (is_win) {
		window.clearInterval(timer_id);
		oImgFace.src = "images/smile_win.gif";
		is_end = true;
	}
}

//Expand the area where there is no mine
function ExpandMineArea(mine_index) {
	var i, j, cur_row, cur_col;
	var temp_array, cur_array = new Array();
	cur_array.push(mine_index);
	while (cur_array.length > 0) {
		temp_array = new Array();
		for (i = 0; i < cur_array.length; i++) {
			var oMine = document.getElementById("mine_" + cur_array[i]);
			//if it is expanded already, then don't expand again
			if (oMine.getAttribute("expanded") === K_TRUE) {
				continue;
			}

			oMine.setAttribute("expanded", true);
			oMine.className = "mine_down";
			oMine.innerText = oMine.getAttribute("mine_value");
			//when the mine's value is "0", expand the relative mine area
			if (oMine.getAttribute("mine_value") == 0) {
				cur_row = Math.floor(cur_array[i] / col_count);
				cur_col = cur_array[i] % col_count;

				//(i-1,j-1) (i-1,j) (i-1,j+1)
				//(i,j-1)   (i,j)	(i,j+1)
				//(i+1,j-1) (i+1,j) (i+1,j+1)	

				//the row (i-1)
				if ((cur_row - 1) >= 0) {
					//(i-1,j-1)
					if ((cur_col - 1) >= 0) {
						j = col_count * (cur_row - 1) + cur_col - 1;
						if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
							temp_array.push(j);
						}
					}
					//(i-1,j)
					j = col_count * (cur_row - 1) + cur_col;
					if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
						temp_array.push(j);
					}
					//(i-1,j+1)
					if ((cur_col + 1) < col_count) {
						j = col_count * (cur_row - 1) + cur_col + 1;
						if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
							temp_array.push(j);
						}
					}
				}

				//the row (i)
				//(i,j-1)
				if ((cur_col - 1) >= 0) {
					j = col_count * cur_row + cur_col - 1;
					if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
						temp_array.push(j);
					}
				}
				//(i,j+1)
				if ((cur_col + 1) < col_count) {
					j = col_count * cur_row + cur_col + 1;
					if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
						temp_array.push(j);
					}
				}

				//the row (i+1)
				if ((cur_row + 1) < row_count) {
					//(i+1,j-1)
					if ((cur_col - 1) >= 0) {
						j = col_count * (cur_row + 1) + cur_col - 1;
						if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
							temp_array.push(j);
						}
					}
					//(i+1,j)
					j = col_count * (cur_row + 1) + cur_col;
					if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
						temp_array.push(j);
					}
					//(i+1,j+1)
					if ((cur_col + 1) < col_count) {
						j = col_count * (cur_row + 1) + cur_col + 1;
						if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
							temp_array.push(j);
						}
					}
				}
			}
		}
		cur_array = temp_array;
	}
}

//create main frame
function MainFrame(row, col, mine_num) {
	var i, j, index;
	var cur_mine;
	var oFragment = document.createDocumentFragment();
	row_count = row;
	col_count = col;
	mine_count = mine_num;
	rest_mine = mine_num;

	//create mine area value, save to array
	var mine_array = InitMineArea(row, col, mine_num);
	//create a new table
	var oMineTable = document.createElement("table");
	oMineTable.cellPadding = 0;
	oMineTable.cellSpacing = 0;
	oMineTable.id = "oMineTable";
	//create thead
	var oTBody = document.createElement("tbody");

	//create a div contains the mine table
	var oContainer = document.createElement("div");
	oContainer.className = "container_border";

	for (i = 0; i < row; i++) {
		var oRow = document.createElement("tr");
		for (j = 0; j < col; j++) {
			index = col * i + j;
			cur_mine = MineButton(mine_array[index], index);
			var oCell = document.createElement("td");
			oCell.appendChild(cur_mine);
			oRow.appendChild(oCell);
		}
		oTBody.appendChild(oRow);
	}

	oMineTable.appendChild(oTBody);
	oContainer.appendChild(oMineTable);
	oFragment.appendChild(oContainer);
	return oFragment;
}

//create mine button
function MineButton(value, index) {
	var oMine = document.createElement("div");
	oMine.id = "mine_" + index;
	oMine.className = "mine_up";
	oMine.setAttribute("mine_value", value);
	oMine.setAttribute("mine_index", index);
	oMine.setAttribute("expanded", false);
	oMine.setAttribute("detected", false);
	oMine.setAttribute("marked", false);
	oMine.setAttribute("pushed", false);

	oMine.onmousedown = function (event) {
		handleMouseEvent(event);
	};
	oMine.onmouseup = function (event) {
		handleMouseUp(event);
	};

	// Added for touch support
	oMine.ontouchstart = function (event) {
		event.preventDefault(); // Prevent default touch behavior
		this.touchStartTime = new Date().getTime(); // Record the time when the touch starts
		this.touchMoved = false; // Track if the touch has moved
		this.addEventListener('touchmove', function () {
			this.touchMoved = true; // Set flag if the touch has moved
		});
	};

	oMine.ontouchend = function (event) {
		event.preventDefault(); // Prevent default touch behavior
		var touchEndTime = new Date().getTime(); // Record the time when the touch ends
		var touchDuration = touchEndTime - this.touchStartTime; // Calculate the touch duration

		if (this.touchMoved) { // If touch has moved, ignore it
			this.touchMoved = false;
			return;
		}

		if (touchDuration < 500) { // If touch duration is less than 500ms, treat it as a left click
			handleLeftClick(this);
		} else { // Otherwise, treat it as a right click
			handleRightClick(this);
		}
	};

	return oMine;
}

// Handle mouse events
function handleMouseEvent(event) {
	var oMine = event.target;
	if (event.button === 0) {
		oMine.className = "mine_down";
		oMine.setAttribute("pushed", true);
	}
}

// Handle left click
function handleLeftClick(oMine) {
	oMine.setAttribute("pushed", false);
	//if this block is marked as a mine, then disable
	if (oMine.getAttribute("marked") === K_TRUE) {
		return false;
	}

	if (is_end) {
		return false;
	}

	if (oMine.getAttribute("expanded") === K_TRUE) {
		return false;
	}
	oMine.setAttribute("expanded", true);

	//if this block is a mine
	if (parseInt(oMine.getAttribute("mine_value"), 10) === 9) {
		//face image is failure
		oImgFace.src = "images/smile_fail.gif";
		//show the mine
		var oBomb = document.createElement("img");
		oBomb.style.width = "15px";
		oBomb.style.height = "15px";
		oBomb.style.padding = "0px";
		oBomb.style.margin = "0px";
		oBomb.src = "images/bomb.gif";
		oMine.appendChild(oBomb);
		//end of game
		is_end = true;
		//expand the main frame
		window.clearInterval(timer_id);
		ExpandAll();
	} else {
		oMine.className = "mine_down";
		//expand the safe area if this block is "0"
		if (oMine.getAttribute("mine_value") === "0") {
			ExpandMineArea(parseInt(oMine.getAttribute("mine_index"), 10));
		} else {
			oMine.innerText = oMine.getAttribute("mine_value");
		}
	}

	if (!is_begin) {
		is_begin = true;
		timer_id = window.setInterval(function () {
			time_count++;
			oRightBox.innerText = time_count;
		}, 1000);
	}

	CheckGameStatus();
}

// Handle right click
function handleRightClick(oMine) {
	if (is_end) {
		return false;
	}

	if (oMine.getAttribute("expanded") === K_TRUE) {
		return false;
	}

	if (oMine.getAttribute("detected") === K_TRUE) {
		//cancel the guess flag
		oMine.className = "mine_up";
		oMine.setAttribute("detected", false);
		return false;
	}

	if (oMine.getAttribute("marked") === K_FALSE) {
		var oFlag = document.createElement("img");
		oFlag.style.width = "15px";
		oFlag.style.height = "15px";
		oFlag.style.padding = "0px";
		oFlag.style.margin = "0px";
		oFlag.src = "images/flag.gif";
		oMine.appendChild(oFlag);
		oMine.setAttribute("marked", true);
		rest_mine--;
		oLeftBox.innerText = rest_mine;
	} else {
		oMine.removeChild(oMine.firstChild);
		oMine.setAttribute("marked", false);
		rest_mine++;
		oLeftBox.innerText = rest_mine;
	}

	if (!is_begin) {
		is_begin = true;
		timer_id = window.setInterval(function () {
			time_count++;
			oRightBox.innerText = time_count;
		}, 1000);
	}

	CheckGameStatus();
}

//Init the game
function Init() {
	oMainFrame = new MainFrame(row_count, col_count, mine_count);
	document.getElementById("playground").appendChild(oMainFrame);

	oLeftBox = document.getElementById("mine_count");
	oLeftBox.innerText = mine_count;
	oRightBox = document.getElementById("time_count");
	oRightBox.innerText = 0;

	var oFaceContainer = document.getElementById("face_button");
	oFaceContainer.appendChild(FaceButton());
}

//Process player's config
function StartGame() {
	var obj = document.getElementById("difficulty");
	var value = obj.value;
	switch (value) {
		case "beginner":
			row_count = 9;
			col_count = 9;
			mine_count = 10;
			break;
		case "intermediate":
			row_count = 16;
			col_count = 16;
			mine_count = 40;
			break;
		case "advanced":
			row_count = 16;
			col_count = 30;
			mine_count = 99;
			break;
	}

	RefreshMainFrame();
}

window.onload = function () {
	document.getElementById("start_button").onclick = StartGame;
}

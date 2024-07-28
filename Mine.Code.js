const K_TRUE = "true";
const K_FALSE = "false";

let oImgFace; // smile face
let oLeftBox; // box that displays the remaining mine count
let oRightBox; // box that displays the elapsed time
let row_count, col_count, mine_count, time_count = 0; // elapsed time
let rest_mine; // remaining mines
let timer_id;
let is_begin = false; // is the game started?
let is_end = false; // is the game ended?
let is_first_click = false; // is the first block opened
let oMainFrame; // game main frame
let nickname;

function InitMineArea(row, col, mine_num, mine_index) {
    const accumulate = row * col;
    const mine_array = new Array(accumulate).fill(0);
    const mine_pos = [...Array(accumulate).keys()];
    let i, j, index, k, l, temp;

    for (i = 0; i < (2 * accumulate); i++) {
        k = Math.floor(Math.random() * accumulate);
        l = Math.floor(Math.random() * accumulate);
        [mine_pos[k], mine_pos[l]] = [mine_pos[l], mine_pos[k]];
    }

    if (mine_index) {
        for (i = 0; i < mine_num; i++) {
            if (mine_pos[i] === mine_index) {
                [mine_pos[i], mine_pos[accumulate]] = [mine_pos[accumulate], mine_pos[i]];
                break;
            }
        }
    }

    for (i = 0; i < mine_num; i++) {
        mine_array[mine_pos[i]] = 9;
    }

    for (i = 0; i < row; i++) {
        for (j = 0; j < col; j++) {
            index = col * i + j;
            if (mine_array[index] === 9) {
                updateAdjacentCells(mine_array, index, i, j, row, col);
            }
        }
    }

    return mine_array;
}

function updateAdjacentCells(mine_array, index, i, j, row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([di, dj]) => {
        const ni = i + di, nj = j + dj;
        if (ni >= 0 && ni < row && nj >= 0 && nj < col) {
            const neighborIndex = col * ni + nj;
            if (mine_array[neighborIndex] !== 9) mine_array[neighborIndex]++;
        }
    });
}

function RefreshMainFrame() {
    is_begin = false;
    is_end = false;
    time_count = 0;
    rest_mine = mine_count;
    is_first_click = false;
    clearInterval(timer_id);
    const oldFrame = oMainFrame;
    oMainFrame = new MainFrame(row_count, col_count, mine_count);
    document.getElementById("playground").replaceChild(oMainFrame, oldFrame);
}

function FaceButton() {
    const oButtonContainer = document.createElement("div");
    const oButtonSelf = document.createElement("div");

    oButtonContainer.className = "container_border";
    oButtonContainer.style.width = "30px";
    oButtonSelf.className = "img_button_up";
    oButtonSelf.style.width = "24px";
    oButtonSelf.style.height = "24px";
    oButtonSelf.setAttribute("pushed", K_FALSE);

    oImgFace = document.createElement("img");
    oImgFace.border = 0;
    oImgFace.src = "images/smile.gif";
    oImgFace.style.padding = "0px";
    oImgFace.style.margin = "2px 0 0 0px";

    oButtonSelf.onmousedown = function () {
        oButtonSelf.className = "img_button_down";
        oButtonSelf.setAttribute("pushed", K_TRUE);
    };

    oButtonSelf.onmouseout = function () {
        if (oButtonSelf.getAttribute("pushed") === K_TRUE) {
            oButtonSelf.className = "img_button_up";
            oButtonSelf.setAttribute("pushed", K_FALSE);
        }
    };

    oButtonSelf.onmouseup = function () {
        if (oButtonSelf.getAttribute("pushed") === K_FALSE) return false;
        oButtonSelf.className = "img_button_up";
        oButtonSelf.setAttribute("pushed", K_FALSE);
        RefreshMainFrame();
    };

    oButtonSelf.appendChild(oImgFace);
    oButtonContainer.appendChild(oButtonSelf);

    return oButtonContainer;
}

function ExpandAll() {
    const accumulate = row_count * col_count;
    for (let i = 0; i < accumulate; i++) {
        const oMine = document.getElementById(`mine_${i}`);
        if (oMine.getAttribute("expanded") === K_FALSE) {
            expandMine(oMine);
        }
    }
}

function expandMine(oMine) {
    const mine_value = parseInt(oMine.getAttribute("mine_value"), 10);
    switch (mine_value) {
        case 9:
            if (oMine.getAttribute("marked") === K_TRUE) {
                oMine.className = "mine_down_bomb";
            } else {
                if (oMine.hasChildNodes()) oMine.removeChild(oMine.firstChild);
                oMine.className = "mine_down_bomb";
                const oBomb = document.createElement("img");
                oBomb.style.width = "15px";
                oBomb.style.height = "15px";
                oBomb.src = "images/bomb.gif";
                oMine.appendChild(oBomb);
                oMine.setAttribute("expanded", K_TRUE);
            }
            break;
    }
    if (oMine.getAttribute("marked") === K_TRUE && mine_value !== 9) {
        if (oMine.hasChildNodes()) oMine.removeChild(oMine.firstChild);
        oMine.className = "mine_down_bomb";
        const oError = document.createElement("img");
        oError.style.width = "15px";
        oError.style.height = "15px";
        oError.src = "images/error.gif";
        oMine.appendChild(oError);
        oMine.setAttribute("expanded", K_TRUE);
    }
}

function GameOver(result) {
    switch (result) {
        case 0: // success
            oImgFace.src = "images/win.gif";
            alert(`Awesome! You have cleared ${mine_count} mines in only ${oRightBox.innerText} seconds!`);
            let resultMessage = `${nickname} has cleared ${mine_count} mines in only ${oRightBox.innerText} seconds! Go to next!`;
            updateGameParameters(resultMessage);
            break;
        case 1: // failure
            ExpandAll();
            oImgFace.src = "images/blast.gif";
            alert("You lose, please try again!");
            resultMessage = `${nickname} ha perso. Ripete il livello con ${mine_count} mine.`;
            updateGameParameters(resultMessage);
            break;
        case 2: // timeout
            alert("Come on! What takes you so long to finish? Please retry!");
            oImgFace.src = "images/blast.gif";
            clearInterval(timer_id);
            break;
    }
    is_begin = false; // get ready to restart
    is_end = true; // it's over
}

function updateGameParameters(resultMessage) {
    clearInterval(timer_id);
    ws.send(JSON.stringify({ type: 'update', message: resultMessage }));
    row_count = Math.min(row_count * 2, 25);
    col_count = Math.min(col_count * 2, 25);
    mine_count += 30;
    oButtonSelf.setAttribute("pushed", K_FALSE);
    RefreshMainFrame();
}

function ExpandMineArea(source) {
    const j = source % col_count;
    const i = Math.floor(source / col_count);
    const oMine = document.getElementById(`mine_${source}`);

    if (oMine.getAttribute("marked") === K_TRUE || oMine.getAttribute("expanded") === K_TRUE || oMine.getAttribute("detected") === K_TRUE) {
        return;
    }

    const temp_value = parseInt(oMine.getAttribute("mine_value"), 10);
    switch (temp_value) {
        case 0:
            oMine.className = "mine_down";
            oMine.setAttribute("expanded", K_TRUE);
            expandAdjacentCells(i, j);
            break;
        case 1: oMine.className = "mine_down_1"; oMine.innerText = "1"; oMine.setAttribute("expanded", K_TRUE); break;
        case 2: oMine.className = "mine_down_2"; oMine.innerText = "2"; oMine.setAttribute("expanded", K_TRUE); break;
        case 3: oMine.className = "mine_down_3"; oMine.innerText = "3"; oMine.setAttribute("expanded", K_TRUE); break;
        case 4: oMine.className = "mine_down_4"; oMine.innerText = "4"; oMine.setAttribute("expanded", K_TRUE); break;
        case 5: oMine.className = "mine_down_5"; oMine.innerText = "5"; oMine.setAttribute("expanded", K_TRUE); break;
        case 6: oMine.className = "mine_down_6"; oMine.innerText = "6"; oMine.setAttribute("expanded", K_TRUE); break;
        case 7: oMine.className = "mine_down_7"; oMine.innerText = "7"; oMine.setAttribute("expanded", K_TRUE); break;
        case 8: oMine.className = "mine_down_8"; oMine.innerText = "8"; oMine.setAttribute("expanded", K_TRUE); break;
        default:
            oMine.className = "mine_down_bomb";
            const oBomb = document.createElement("img");
            oBomb.style.width = "15px";
            oBomb.style.height = "15px";
            oBomb.src = "images/bomb.gif";
            oMine.appendChild(oBomb);
            oMine.setAttribute("expanded", K_TRUE);
            GameOver(1);
            return;
    }
}

function expandAdjacentCells(i, j) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([di, dj]) => {
        const ni = i + di, nj = j + dj;
        if (ni >= 0 && ni < row_count && nj >= 0 && nj < col_count) {
            const index = col_count * ni + nj;
            const oMine = document.getElementById(`mine_${index}`);
            if (oMine && oMine.getAttribute("expanded") === K_FALSE) {
                ExpandMineArea(index);
            }
        }
    });
}

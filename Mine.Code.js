const K_TRUE = "true", K_FALSE = "false";
var oImgFace, oLeftBox, oRightBox, row_count, col_count, mine_count, time_count = 0, rest_mine, timer_id, is_begin = !1, is_end = !1, is_first_click = !1, oMainFrame, nickname;

function InitMineArea(e, t, n, i) {
    var o, r, a, s, u, d, c = e * t, m = new Array(c), _ = new Array(c);
    for (o = 0; o < c; o++) _[o] = o;
    for (o = 0; o < 2 * c; o++) s = Math.round(Math.random() * c), u = Math.round(Math.random() * c), d = _[s], _[s] = _[u], _[u] = d;
    for (o = 0; o < e; o++) for (r = 0; r < t; r++) m[a = t * o + r] = 0;
    if (i) for (o = 0; o < n; o++) if (_[o] === i) {
        var l = _[o];
        _[o] = _[c], _[c] = l;
        break
    }
    for (o = 0; o < n; o++) m[_[o]] = 9;
    for (o = 0; o < e; o++) for (r = 0; r < t; r++) 9 === m[a = t * o + r] && (r - 1 >= 0 && 9 != m[a = t * o + r - 1] && m[a]++, r + 1 < t && 9 != m[a = t * o + r + 1] && m[a]++, o - 1 >= 0 && (9 != m[a = t * (o - 1) + r] && m[a]++, r - 1 >= 0 && 9 != m[a = t * (o - 1) + r - 1] && m[a]++, r + 1 < t && 9 != m[a = t * (o - 1) + r + 1] && m[a]++), o + 1 < e && (9 != m[a = t * (o + 1) + r] && m[a]++, r - 1 >= 0 && 9 != m[a = t * (o + 1) + r - 1] && m[a]++, r + 1 < t && 9 != m[a = t * (o + 1) + r + 1] && m[a]++));
    return m
}

function RefreshMainFrame() {
    is_begin = !1, is_end = !1, time_count = 0, rest_mine = mine_count, is_first_click = !1, window.clearInterval(timer_id);
    var e = oMainFrame;
    oMainFrame = new MainFrame(row_count, col_count, mine_count), document.getElementById("playground").replaceChild(oMainFrame, e)
}

function FaceButton() {
    var oButtonContainer = document.createElement("div"), oButtonSelf = document.createElement("div");
    with(oButtonContainer.className = "container_border", oButtonContainer.style.width = "30px", oButtonSelf.className = "img_button_up", oButtonSelf.style.width = "24px", oButtonSelf.style.height = "24px", oButtonSelf.setAttribute("pushed", !1), oImgFace = document.createElement("img"), oImgFace.border = 0, oImgFace.src = "images/smile.gif", oImgFace.style.padding = "0px", oImgFace.style.margin = "2px 0 0 0px", oButtonSelf) onmousedown = function () {
        oButtonSelf.className = "img_button_down", oButtonSelf.setAttribute("pushed", !0)
    }, onmouseout = function () {
        oButtonSelf.getAttribute("pushed") === K_TRUE && (oButtonSelf.className = "img_button_up", oButtonSelf.setAttribute("pushed", !1))
    }, onmouseup = function () {
        if (oButtonSelf.getAttribute("pushed") === K_FALSE) return !1;
        oButtonSelf.className = "img_button_up", oButtonSelf.setAttribute("pushed", !1), RefreshMainFrame()
    };
    return oButtonSelf.appendChild(oImgFace), oButtonContainer.appendChild(oButtonSelf), oButtonContainer
}

function ExpandAll() {
    var e, t, n, i, o = row_count * col_count;
    for (e = 0; e < o; e++) if ((t = document.getElementById("mine_" + e)).getAttribute("expanded") === K_FALSE) {
        switch (parseInt(t.getAttribute("mine_value"), 10)) {
            case 9:
                if (t.getAttribute("marked") === K_TRUE) {
                    t.className = "mine_down_bomb";
                    break
                }
                t.hasChildNodes() && t.removeChild(t.firstChild), t.className = "mine_down_bomb", (n = document.createElement("img")).style.width = "15px", n.style.height = "15px", n.style.padding = "0px", n.style.margin = "0px", n.src = "images/bomb.gif", t.appendChild(n), t.setAttribute("expanded", !0)
        }
        t.getAttribute("marked") === K_TRUE && "9" != t.getAttribute("mine_value") && (t.hasChildNodes() && t.removeChild(t.firstChild), t.className = "mine_down_bomb", t.innerText = "", (i = document.createElement("img")).style.width = "15px", i.style.height = "15px", i.style.padding = "0px", i.style.margin = "0px", i.src = "images/error.gif", t.appendChild(i), t.setAttribute("expanded", !0))
    }
}

function GameOver(e) {
    switch (e) {
        case 0:
            oImgFace.src = "images/win.gif", alert("Awesome! You have cleared " + mine_count + " mines in only " + oRightBox.innerText + " seconds!"), e = nickname + " has cleared " + mine_count + " mines in only " + oRightBox.innerText + " seconds! Go to next!", (row_count *= 2) > 30 && (row_count = 25), (col_count *= 2) > 30 && (col_count = 25), mine_count += 30, window.clearInterval(timer_id), ws.send(JSON.stringify({
                type: "update",
                message: e
            })), oButtonSelf.setAttribute("pushed", "false"), RefreshMainFrame();
            break;
        case 1:
            ExpandAll(), oImgFace.src = "images/blast.gif", alert("You lose, please try again!"), e = nickname + " ha perso. Ripete il livello con " + mine_count + " mine.", window.clearInterval(timer_id), ws.send(JSON.stringify({
                type: "update",
                message: e
            })), oButtonSelf.setAttribute("pushed", "false"), RefreshMainFrame();
            break;
        case 2:
            alert("Come on! What takes you so long to finish? Please retry!"), oImgFace.src = "images/blast.gif", window.clearInterval(timer_id)
    }
    is_begin = !1, is_end = !0
}

function ExpandMineArea(e) {
    var t, n;
    n = e % col_count, t = Math.round((e - n) / col_count);
    var i = document.getElementById("mine_" + e);
    if (i.getAttribute("marked") === K_TRUE || i.getAttribute("expanded") === K_TRUE || i.getAttribute("detected") === K_TRUE) return !1;
    switch (parseInt(i.getAttribute("mine_value"), 10)) {
        case 0:
            if (i.className = "mine_down", expanded = i.getAttribute("expanded"), expanded === K_TRUE) return;
            i.setAttribute("expanded", !0), n - 1 >= 0 && ExpandMineArea(col_count * t + n - 1), n + 1 < col_count && ExpandMineArea(col_count * t + n + 1), t - 1 >= 0 && (ExpandMineArea(col_count * (t - 1) + n), n - 1 >= 0 && ExpandMineArea(col_count * (t - 1) + n - 1), n + 1 < col_count && ExpandMineArea(col_count * (t - 1) + n + 1)), t + 1 < row_count && (ExpandMineArea(col_count * (t + 1) + n), n - 1 >= 0 && ExpandMineArea(col_count * (t + 1) + n - 1), n + 1 < col_count && ExpandMineArea(col_count * (t + 1) + n + 1));
            break;
        case 9:
            GameOver(1);
            break;
        default:
            i.className = "mine_down", i.innerText = i.getAttribute("mine_value"), i.setAttribute("expanded", !0)
    }
}

function DisplayGameTime() {
    oRightBox.innerText = ++time_count
}

function MainFrame(e, t, n) {
    var i, o, r, a, s, u, d, c, m, _;
    row_count = e, col_count = t, mine_count = n, rest_mine = mine_count;
    var l = document.createElement("table"), p = document.createElement("tbody");
    for (document.getElementById("playground").style.width = 16 * col_count + "px", l.cellPadding = 0, l.cellSpacing = 0, l.border = 0, l.id = "main_frame", l.className = "container_border", l.style.width = 16 * col_count + "px", l.appendChild(p), o = 0; o < row_count; o++) for (a = document.createElement("tr"), a.style.height = "16px", p.appendChild(a), r = 0; r < col_count; r++) i = o * col_count + r, s = document.createElement("td"), s.style.width = "16px", s.id = "mine_" + i, s.setAttribute("expanded", !1), s.setAttribute("marked", !1), s.setAttribute("detected", !1), s.setAttribute("mine_value", 0), s.oncontextmenu = function (e) {
        return e.preventDefault(), !1
    }, s.ontouchstart = function (e) {
        this.touchstart = Date.now();
    }, s.ontouchend = function (e) {
        if (Date.now() - this.touchstart > 500) {
            e.preventDefault();
            RightClick(this.id.replace("mine_", ""));
        } else {
            LeftClick(this.id.replace("mine_", ""));
        }
    }, a.appendChild(s);
    for (m = InitMineArea(row_count, col_count, mine_count), d = 0; d < row_count; d++) for (u = 0; u < col_count; u++) c = d * col_count + u, _ = document.getElementById("mine_" + c), _.setAttribute("mine_value", m[c]);
    var g = document.createElement("div");
    g.className = "container_border", g.style.width = 16 * col_count + "px";
    var f = document.createElement("div"), v = document.createElement("div"), h = document.createElement("div"), y = document.createElement("div"), x = document.createElement("img");
    return h.className = "container_border", h.style.width = "30px", oLeftBox = document.createElement("div"), oLeftBox.className = "count_box", oLeftBox.style.width = "46px", oLeftBox.innerText = mine_count, y.className = "container_border", y.style.width = "30px", oRightBox = document.createElement("div"), oRightBox.className = "count_box", oRightBox.style.width = "46px", oRightBox.innerText = time_count, x.style.width = "23px", x.style.height = "23px", x.style.padding = "0px", x.style.margin = "1px 0px 0px 3px", x.src = "images/logo.jpg", x.onclick = function () {
        ws.send(JSON.stringify({
            type: "get_players"
        }))
    }, v.className = "container_border", v.style.width = "30px", f.appendChild(oLeftBox), f.appendChild(FaceButton()), f.appendChild(oRightBox), g.appendChild(f), g.appendChild(x), g.appendChild(v), document.getElementById("playground").appendChild(g), l
}

function UpdateRestMine(e) {
    rest_mine += e, rest_mine < 0 ? rest_mine = 0 : rest_mine > mine_count && (rest_mine = mine_count), oLeftBox.innerText = rest_mine
}

function LeftClick(e) {
    var t = document.getElementById("mine_" + e);
    if (is_first_click || (timer_id = window.setInterval(DisplayGameTime, 1e3), is_first_click = !0), t.getAttribute("marked") === K_TRUE || t.getAttribute("expanded") === K_TRUE) return !1;
    switch (parseInt(t.getAttribute("mine_value"), 10)) {
        case 0:
            ExpandMineArea(e);
            break;
        case 9:
            GameOver(1);
            break;
        default:
            t.className = "mine_down", t.innerText = t.getAttribute("mine_value"), t.setAttribute("expanded", !0)
    }
}

function RightClick(e) {
    var t = document.getElementById("mine_" + e), n = parseInt(t.getAttribute("mine_value"), 10);
    if (is_first_click || (timer_id = window.setInterval(DisplayGameTime, 1e3), is_first_click = !0), t.getAttribute("expanded") === K_TRUE) return !1;
    if (t.getAttribute("marked") === K_FALSE) {
        if (t.setAttribute("marked", K_TRUE), UpdateRestMine(-1), 9 === n) {
            if (t.className = "mine_up_marked", 0 == --mine_count) return GameOver(0), !0;
        } else t.className = "mine_up_marked"
    } else t.getAttribute("marked") === K_TRUE && (t.setAttribute("marked", K_FALSE), t.className = "mine_up", UpdateRestMine(1))
}

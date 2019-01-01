'use strict';

let cleared = localStorage.getItem("cleared"),
    now = (new Date()).getTime();
if ((now - cleared) > 1000 * 60 * 60 * 2) {
    localStorage.clear();
    localStorage.setItem("cleared", now);
}

let audio = document.querySelector("audio"),
    muteButton = document.querySelector("#mute"),
    muted = false;
audio.volume = 0.5;
muteButton.addEventListener('click', () => {
    if ( muted !== true ) {
        audio.muted = true;
        muted = !muted;
        muteButton.innerText = "zesílit";
        localStorage.setItem("muted", muted);
    } else {
        audio.muted = false;
        muted = !muted;
        muteButton.innerText = "ztlumit";
        localStorage.setItem("muted", muted);
    }
});
if (localStorage.getItem("muted") === "true") {
    audio.muted = true;
    muted = !muted;
    muteButton.innerText = "zesílit";
}

let change_topic = document.querySelector("#change"),
    set_topics = document.querySelector("#settopics"),
    set_default = document.querySelector("#setdefault");

let section_navigation = document.querySelector('#navigation'),
    section_intro = document.querySelector('#intro'),
    section_settings = document.querySelector('#settings'),
    section_game = document.querySelector('#game');

let canvas = document.querySelector("canvas"),
    c = canvas.getContext("2d");

canvas.width = section_settings.offsetWidth;
canvas.height = section_settings.offsetHeight;

let topic = '{\n' +
    '  "topics": [\n' +
    '    {"name": "zvířata"},\n' +
    '    {"name": "apple"},\n' +
    '    {"name": "microsoft"},\n' +
    '    {"name": "jelení lůj"},\n' +
    '    {"name": "vesmír"},\n' +
    '    {"name": "tesla"},\n' +
    '    {"name": "fotbal"},\n' +
    '    {"name": "hokej"},\n' +
    '    {"name": "curling"},\n' +
    '    {"name": "vánoce"},\n' +
    '    {"name": "anime"},\n' +
    '    {"name": "euro"},\n' +
    '    {"name": "evropská unie"},\n' +
    '    {"name": "soudní moc"},\n' +
    '    {"name": "prezident"},\n' +
    '    {"name": "hasiči"},\n' +
    '    {"name": "kinematografie"},\n' +
    '    {"name": "ikea"},\n' +
    '    {"name": "šachy"},\n' +
    '    {"name": "deskové hry"},\n' +
    '    {"name": "ježíšek"},\n' +
    '    {"name": "káva"},\n' +
    '    {"name": "metro"},\n' +
    '    {"name": "brno"},\n' +
    '    {"name": "praha"},\n' +
    '    {"name": "slovenská republika"}\n' +
    '  ]\n' +
    '}';
let obj;

let tops = localStorage.getItem("topics");
if (tops !== undefined) {
    if (tops !== null) {
        if (tops.length !== 0) {
            obj = JSON.parse(topic);
        }
    }
} else {
    obj = JSON.parse(topic);
}


document.querySelector("[name='duration']").value = localStorage.getItem("duration");
document.querySelector("[name='change']").value = localStorage.getItem("change");

function settings() {
    let duration = document.querySelector("[name='duration']").value,
        change = document.querySelector("[name='change']").value;

    if (duration == 0 || change == 0 || parseInt(change) > parseInt(duration)) {
        localStorage.removeItem("duration");
        localStorage.removeItem("change");
        return 1;
    } else {
        localStorage.setItem("duration", duration);
        localStorage.setItem("change", change);
        return 0;
    }
}

//TODO split by newline

function setTopics() {
    let topics = document.querySelector("[name='topics']").value;
    if (topics === "") {
        warn();
    } else {
        localStorage.setItem("topics", topics);
        let new_topics = localStorage.getItem("topics").split(","),
            nt = '{\n' +
                '  "topics": [';
        for (let i = 0; i < new_topics.length; i++) {
            new_topics[i] = new_topics[i].trim();
            if ((i + 1) == new_topics.length) {
                nt += '{"name": "' + new_topics[i] + '"}';
            } else {
                nt += '{"name": "' + new_topics[i] + '"},';
            }
        }
        nt += '  ]\n' +
            '}';
        return nt;
    }
}

set_topics.addEventListener('click', (ev) => {
    ev.preventDefault();
    let nt = setTopics();
    if (nt == undefined) {
        warn();
    } else {
        localStorage.setItem("custom_topics", nt);
        obj = JSON.parse(nt);
        changeTopic();
    }
});
set_default.addEventListener('click', (ev) => {
   ev.preventDefault();
   obj = JSON.parse(topic);
   changeTopic();
});

function Text(x, y, dx, dy, fs, content, is_chosen) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.fs = fs;
    this.content = content;
    this.is_chosen = is_chosen;

    this.change = {
        x: false,
        y: false
    };

    this.say = () => {
        if (this.is_chosen === 1) {
            c.fillStyle = "#021B79";
            c.font = this.fs * 1.25 + "px" + " Raleway-SemiBold";
        } else {
            c.fillStyle = "#0575E6";
            c.font = this.fs + "px" + " Raleway-Thin";
        }

        this.width = c.measureText(this.content.toUpperCase()).width;
        c.fillText((this.content).toUpperCase(), this.x, this.y);
    };

    this.update = () => {
        if ((this.x + this.width >= innerWidth || this.x < 0) && !this.change.x) {
            this.dx = -this.dx;
            this.change.x = true;
        } else if(this.x + this.width <= innerWidth && this.x > 0)
            this.change.x = false;

        if ((this.y > innerHeight || this.y <= (this.fs * 0.90)) && !this.change.y) {
            this.dy = -this.dy;
            this.change.y = true;
        } else if(this.y < innerHeight && this.y >= (this.fs * 0.90))
            this.change.y = false;

        this.x += this.dx;
        this.y += this.dy;
        this.say();
    };
}

let i, j, x, y, dx, dy, fs, content, chosen, random, is_chosen = 0, texts = [], cc = 0, count = 75;

function changeTopic() {
    texts.length = 0;
    if (obj == undefined) {
        obj = JSON.parse(topic);
    }
    chosen = Math.floor((Math.random() * obj.topics.length));

    for (i = 0; i < count; i++) {
        is_chosen = 0;
        x = section_settings.offsetWidth / 1.75;
        y = section_settings.offsetHeight / 2;
        dx = (Math.random() - 0.5) * 5;
        dy = (Math.random() - 0.5) * 5;
        fs = ((Math.random() * 50) + 5).toString();
        random = Math.floor((Math.random() * obj.topics.length));
        content = obj.topics[random].name;
        if (chosen === random) {
            is_chosen = 1;
            cc++;
        }
        texts.push(new Text(x, y, dx, dy, fs, content, is_chosen));
        if ((i + 1) === count && cc < 3) {
            count += 10;
        }
    }
}
changeTopic();

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);
    for (j = 0; j < texts.length; j++) {
        texts[j].update();
    }
}

animate();

change_topic.addEventListener('click', (ev) => {
    ev.preventDefault();
    changeTopic();
});

let imgs = '{\n' +
    '  "imgs": [\n' +
    '    {"url": "https://www.kachwanya.com/wp-content/uploads/2015/10/kachwanya-2.jpg"},\n' +
    '    {"url": "https://upload.wikimedia.org/wikipedia/commons/e/e4/TandemTurkey01_ST_05.jpg"},\n' +
    '    {"url": "https://i1.wp.com/www.zmescience.com/wp-content/uploads/2016/12/Capture.png?resize=1439%2C785"},\n' +
    '    {"url": "https://www.bleepstatic.com/content/posts/2018/03/12/NSA-Shadow-Brokers.png"},\n' +
    '    {"url": "https://static.politico.com/dims4/default/fe652c1/2147483647/resize/1160x/quality/90/?url=https%3A%2F%2Fstatic.politico.com%2F61%2F43%2F5abc0c294137a8329f76dd8ac7f3%2Ffbi-2-ap.jpg"},\n' +
    '    {"url": "https://img.cncenter.cz/img/12/normal1050/4970502_pariz-francie-v0.jpg?v=0"},\n' +
    '    {"url": "http://www.seflsa.estranky.cz/img/original/5/dsc_8405.jpg"},\n' +
    '    {"url": "https://m.static.lagardere.cz/frekvence1/2018/03/shutterstock-579877090-610x451.jpg"},\n' +
    '    {"url": "https://1gr.cz/fotky/idnes/07/101/maxi/PKA1e30ef_crash.jpg"},\n' +
    '    {"url": "http://www.edolo.cz/data/images/thumb/752_d3bd00e65f.jpg"}\n' +
    '  ]\n' +
    '}';
let img = JSON.parse(imgs);

let play = document.querySelector('#play'),
    countdown = document.querySelector('#countdown'),
    endgame = document.querySelector("#endgame");

function warn() {
    let alert = document.querySelector('.alert');
    alert.classList.add('warning');
    alert.innerHTML = "Překontrolujte prosím nastavení prezentace.";
    alert.style.display = 'flex';
    let dis = setTimeout(() => {
        alert.style.display = 'none';
        clearTimeout(dis);
    }, 3000)
}

function game() {
    if (settings() != 0) {
        warn();
    } else {
        let count = 3,
            topic_display = countdown.querySelector('h2'),
            countdown_display = countdown.querySelector('h4'),
            rand = Math.floor((Math.random() * 10) + 1);
        if (endgame.style.display !== 'none') {
            endgame.style.display = 'none';
        }
        section_navigation.style.display = 'none';
        section_intro.style.display = 'none';
        section_settings.style.display = 'none';
        section_game.style.display = 'flex';
        topic_display.style.display = 'block';
        topic_display.innerHTML = "Vaše téma je " + "<mark>" + obj.topics[chosen].name + "</mark>";
        let ss;
        let cd = setInterval(() => {
            countdown_display.innerHTML = count.toString();
            if (count === 0) {
                clearInterval(cd);
                topic_display.style.display = 'none';
                countdown_display.style.display = 'none';
                setTimeout(() => {
                    clearInterval(ss);
                    section_game.style.background = "none";
                    countdown_display.style.display = 'flex';
                    countdown_display.innerHTML = "THANK YOU";
                    endgame.style.display = 'flex';
                }, localStorage.getItem("duration") * 1000);
                section_game.style.background = 'url("' + img.imgs[rand].url + '") center center no-repeat / contain';
                ss = setInterval(() => {
                    rand = Math.floor((Math.random() * 10) + 1);
                    section_game.style.background = 'url("' + img.imgs[rand].url + '") center center no-repeat / contain';
                }, localStorage.getItem("change") * 1000);
            }
            count--;
        }, 1000);
    }
}

play.addEventListener('click', (ev) => {
    ev.preventDefault();
    game();
});

let adjust = document.querySelector('#adjust'),
    again = document.querySelector('#again');

adjust.addEventListener('click', () => {
    section_navigation.style.display = 'flex';
    section_intro.style.display = 'flex';
    section_settings.style.display = 'flex';
    section_game.style.display = 'none';
    location.href = '#settings';
});
again.addEventListener('click', () => {
    game();
});
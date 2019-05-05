//
// Helper component for in-app navigation
//
Vue.component('nav-link', {
  template: `<a v-bind:href="href" v-on:click="navigate"><slot></slot></a>`,
  props: {
    href: {
      type: String,
      required: true,
    },
  },
  computed: {
    isActive() {
      return this.href === this.$root.currentRoute;
    },
  },
  methods: {
    navigate(event) {
      event.preventDefault();
      this.$root.currentRoute = this.href;
      window.history.pushState(null, routes[this.href], this.href);
    },
  },
});

//
// Main screen
//
const Toolbar = {
  template: `
    <div class="toolbar">
      <div class="icon icon-settings">
        <nav-link href="#settings">
          <svg
            xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="var(--theme-accent-color)" stroke-width="2" stroke-linecap="square"
            stroke-linejoin="arcs"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 
            0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0
            1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2
            2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2
            2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0
            1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2
            0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2
            0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51
            1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </nav-link>
      </div>
    </div>
  `,
};

const DayStats = {
  template: `
    <div class="day-stats">
      <div v-for="item in items" class="dot"
        v-bind:class="{finished: item.finished, half: item.half}"></div>
    </div>
  `,
  props: ['total', 'finished'],
  computed: {
    items: function() {
      return Array(+this.total)
        .fill()
        .map((item, i) => ({
          finished: i < +this.finished,
          half: i === +this.finished,
        }));
    },
  },
};

const Countdown = {
  props: ['total', 'current', 'running'],
  template: `
    <div class="timer-container">
      <div class="timer">
        <svg class="arc" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
          <defs>
            <pattern id="diagonal-hatch" patternUnits="userSpaceOnUse" width="4" height="4">
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" style="stroke:var(--theme-accent-color);
                stroke-width:0.5" />
            </pattern>
          </defs>
          <path class="arc-path" style="fill: url(#diagonal-hatch)" :d="arc"></path>
        </svg>
        <div class="countdown-container">
          <div class="buttons"></div>
          <div class="countdown">
            {{minutes}}
          </div>
          <div v-if="!running && current === 0" class="buttons">
            <div class="btn" v-on:click="$emit('work')">WORK</div>
            <div class="btn" v-on:click="$emit('break')">BREAK</div>
          </div>
          <div v-else="" class="buttons">
            <div class="btn" v-on:click="$emit('stop')">STOP</div>
            <div v-if="!running && current > 0" class="btn" v-on:click="$emit('resume')">RESUME</div>
            <div v-else="" class="btn" v-on:click="$emit('pause')">PAUSE</div>
          </div>
        </div>
      </div>
    </div>
  `,
  computed: {
    minutes: function() {
      const minutes = (this.current / 60) | 0;
      const seconds = this.current % 60;
      return `${minutes < 10 ? '0' : ''}${minutes}:${
        seconds < 10 ? '0' : ''
      }${seconds}`;
    },
    arc: function() {
      let degrees = (this.current * 359.99) / this.total;
      const round = 360 / 32;
      //degrees = Math.round(degrees / round) * round;
      const polarToCartesian = (cx, cy, r, angle) => {
        let rad = ((angle - 90) * Math.PI) / 180;
        return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
      };
      const start = polarToCartesian(100, 100, 100, degrees);
      const end = polarToCartesian(100, 100, 100, 0);
      const arcSweep = degrees <= 180 ? '0' : '1';
      const d = `
          M ${start.x} ${start.y}
          A 100 100 0 ${arcSweep} 0 ${end.x} ${end.y}
          L 100 100
          L ${start.x} ${start.y}
        `;
      return d;
    },
  },
};

const RouteMain = {
  data: function() {
    return timer;
  },
  template: `
    <div>
      <toolbar />
      <countdown :total="total" :current="current" :running="!!tid"
      v-on:pause="pause" v-on:resume="resume" v-on:stop="stop"
      v-on:work="startWork" v-on:break="startBreak" />
      <day-stats :total="daily" :finished="finishedRounds" />
    </div>
  `,
  components: {
    toolbar: Toolbar,
    countdown: Countdown,
    'day-stats': DayStats,
  },
  computed: {
    daily: function() {
      return Math.round(
        timer.finishedRounds +
          Math.max(timer.goalDuration - timer.finishedDuration, 0) / timer.workDuration,
      );
    },
  },
  methods: {
    pause: function() {
      timer.paused = true;
      stopTimer();
    },
    resume: function() {
      timer.paused = false;
      startTimer();
    },
    stop: function() {
      timer.stopped = true;
      stopTimer(true);
    },
    startWork: function() {
      timer.stopped = false;
      startTimer('work');
    },
    startBreak: function() {
      timer.stopped = false;
      startTimer('break');
    },
  },
};

//
// Settings screen
//
const RouteSettings = {
  data: function() {
    return timer;
  },
  template: `
  <div>
    <div class="toolbar">
      <nav-link href="/" class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          fill="none" stroke="var(--theme-accent-color)" stroke-width="2" stroke-linecap="square"
          stroke-linejoin="arcs"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </nav-link>
    </div>
    <div class="settings">
      <h2>WORK</h2>
      <ul>
        <li v-on:click="setTotal('work', 1500)" :class="{selected: workDuration == 1500}">25m</li>
        <li v-on:click="setTotal('work', 2700)" :class="{selected: workDuration == 2700}">45m</li>
        <li v-on:click="setTotal('work', 3600)" :class="{selected: workDuration == 3600}">60m</li>
        <li v-on:click="setTotal('work', 5400)" :class="{selected: workDuration == 5400}">90m</li>
      </ul>
      <h2>BREAK</h2>
      <ul>
        <li v-on:click="setTotal('break', 300)" :class="{selected: breakDuration == 300}">5m</li>
        <li v-on:click="setTotal('break', 600)" :class="{selected: breakDuration == 600}">10m</li>
        <li v-on:click="setTotal('break', 900)" :class="{selected: breakDuration == 900}">15m</li>
        <li v-on:click="setTotal('break', 1800)" :class="{selected: breakDuration == 1800}">30m</li>
      </ul>
      <h2>DAILY GOAL</h2>
      <ul>
        <li v-on:click="setGoal(0)" :class="{selected: goalDuration == 0}">NONE</li>
        <li v-on:click="setGoal(10800)" :class="{selected: goalDuration == 10800}">EASY</li>
        <li v-on:click="setGoal(18000)" :class="{selected: goalDuration == 18000}">NORM</li>
        <li v-on:click="setGoal(25200)" :class="{selected: goalDuration == 25200}">HARD</li>
      </ul>
    </div>
  </div>
  `,
  methods: {
    setTotal(mode, total) {
      if (timer.mode === mode && timer.current) {
        let passed = timer.total - timer.current;
        timer.current = total - passed;
        timer.total = total;
      }
      if (mode === 'work') {
        timer.workDuration = total;
      } else if (mode === 'break') {
        timer.breakDuration = total;
      }
    },
    setGoal(goal) {
      timer.goalDuration = goal;
    },
  },
};

//
// Countdown timer model
//
let timer = {
  mode: '',
  tid: undefined,
  total: 1500,
  current: 0,
  workDuration: 1500,
  breakDuration: 300,
  goalDuration: 0,
  lastFinishedTimestamp: 0,
  finishedRounds: 0,
  finishedDuration: 0,
};
const saveTimer = () => {
  localStorage.setItem('timer-v1', JSON.stringify(timer));
};
const startTimer = mode => {
  if (timer.tid) {
    stopTimer();
  }
  if (mode) {
    timer.mode = mode;
    timer.total = mode === 'work' ? timer.workDuration : timer.breakDuration;
    timer.current = timer.total;
  }
  timer.tid = setInterval(() => {
    timer.current--;
    if (timer.current === 0) {
      if (timer.mode === 'work') {
        timer.finishedRounds++;
        timer.finishedDuration += timer.workDuration;
      }
      stopTimer(true);
    }
    saveTimer();
  }, 1000);
  saveTimer();
};
const stopTimer = reset => {
  clearInterval(timer.tid);
  timer.tid = undefined;
  if (reset) {
    timer.current = 0;
  }
  saveTimer();
};

timer = Object.assign(
  timer,
  JSON.parse(localStorage.getItem('timer-v1') || '{}'),
);
if (timer.tid) {
  startTimer();
}

//
// Application root and routing
//
const routes = {
  '#': RouteMain,
  '#settings': RouteSettings,
};

const app = new Vue({
  el: '#app',
  data: {
    currentRoute: window.location.pathname,
  },
  computed: {
    ViewComponent() {
      return routes[this.currentRoute] || RouteMain;
    },
  },
  render(h) {
    return h(this.ViewComponent);
  },
});

window.addEventListener('popstate', () => {
  app.currentRoute = window.location.pathname;
});

new NoSleep().enable();

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
      <div class="icon icon-stats">
        <nav-link href="#stats">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="#e91e63" stroke-width="2" stroke-linecap="square"
            stroke-linejoin="arcs"
          >
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </nav-link>
      </div>
      <div class="icon icon-settings">
        <nav-link href="#settings">
          <svg
            xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="#e91e63" stroke-width="2" stroke-linecap="square"
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
              <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" style="stroke:#e91e63; stroke-width:0.5" />
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

let timer = {
  tid: undefined,
  total: 1500,
  current: 668,
  workDuration: 1500,
  breakDuration: 300,
};
const startTimer = interval => {
  if (timer.tid) {
    stopTimer();
  }
  if (interval) {
    timer.total = interval;
    timer.current = interval;
  }
  timer.tid = setInterval(() => {
    timer.current--;
    if (timer.current === 0) {
      stopTimer(true);
    }
    localStorage.setItem('timer-v1', JSON.stringify(timer));
  }, 1000);
  localStorage.setItem('timer-v1', JSON.stringify(timer));
};
const stopTimer = reset => {
  clearInterval(timer.tid);
  timer.tid = undefined;
  if (reset) {
    timer.current = 0;
  }
  localStorage.setItem('timer-v1', JSON.stringify(timer));
};

timer = JSON.parse(localStorage.getItem('timer-v1') || JSON.stringify(timer));
if (timer.tid) {
  startTimer();
}

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
      <day-stats total="7" finished="3" />
    </div>
  `,
  components: {
    toolbar: Toolbar,
    countdown: Countdown,
    'day-stats': DayStats,
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
      startTimer(timer.workDuration);
    },
    startBreak: function() {
      timer.stopped = false;
      startTimer(timer.breakDuration);
    },
  },
};

//
// Settings screen
//
const RouteSettings = {
  template: `
  <div>
    <p>Settings</p>
    <nav-link href="/">Back</nav-link>
  </div>
  `,
};

//
// Stats screen
//
const RouteStats = {
  template: `
  <div>
    <p>Stats</p>
    <nav-link href="/">Back</nav-link>
  </div>
  `,
};

//
// Application root and routing
//
const routes = {
  '#': RouteMain,
  '#settings': RouteSettings,
  '#stats': RouteStats,
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

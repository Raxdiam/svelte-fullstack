<script lang="ts">
  import { Router, Link, Route } from 'svelte-navigator';
  import Home from './routes/Home.svelte';
  import About from './routes/About.svelte';
</script>

<Router>
  <nav>
    <Link to="/">Home</Link>
    <Link to="about">About</Link>
  </nav>
  <div id="root">
    <Route path="/">
      <Home name="World" />
    </Route>
    <Route path="about" component={About} />
  </div>
</Router>

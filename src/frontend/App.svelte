<script lang="ts">
  import { Router, Link, Route } from 'svelte-navigator';
  import Home from './routes/Home.svelte';
  import About from './routes/About.svelte';

  const fetchName = (async () => {
    const response = await fetch('/name');
    return await response.text();
  })();
</script>

<Router>
  <nav>
    <Link to="/">Home</Link>
    <Link to="about">About</Link>
  </nav>
  <div id="root">
    <Route path="/">
      {#await fetchName then data}
        <Home name={data} />
      {/await}
    </Route>
    <Route path="about" component={About} />
  </div>
</Router>

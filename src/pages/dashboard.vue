<template>
  <main class="dashboard-page">
    <h1>Hello world, this is the dashboard placeholder.</h1>
  </main>
</template>

<style scoped>
  .dashboard-page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #080808;
    color: #ffffff;
    font-family: 'Roboto Condensed', 'Roboto', Arial, sans-serif;
  }

  .dashboard-page h1 {
    margin: 0;
    font-size: clamp(2rem, 2vw, 5rem);
    font-weight: 900;
    letter-spacing: 0;
  }
</style>

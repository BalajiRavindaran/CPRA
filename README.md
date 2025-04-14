<h1>Counterparty Risk Assessment with Wallet Ranking (<a href="https://frontend-dot-dssdigitalwalletrank.uc.r.appspot.com/">DEPLOYED CPRA</a>)</h1> 
  <p><strong>Authors:</strong> Balaji Ravindaran, Mohammad Riyazuddin</p>

  <div class="section">
    <h2>Overview</h2>
    <p>The CPRA system measures the risk associated with digital wallets based on their transaction history, counterparty reputation, and risk propagation over time. It provides interactive visualizations and dynamic risk score calculations.</p>
  </div>

  <div class="section">
    <h2>Frontend</h2>
    <p>The frontend serves as the user interface, enabling users to interact with the system and visualize results. Key features include:</p>
    <ul>
      <li><strong>Wallet Network Configuration:</strong> Create wallets and configure simulation parameters such as risky wallet count and risk decay settings.</li>
      <li><strong>Interactive Network Graph:</strong> Visualize wallet connections and risk levels using a dynamic graph.</li>
      <li><strong>Wallet Details:</strong> Clickable wallets provide detailed information, including risk score history and transaction logs.</li>
      <li><strong>Simulation Controls:</strong> Simulate transactions and adjust algorithm parameters like damping factor, iterations, and high-risk threshold.</li>
    </ul>
  </div>

  <div class="section">
    <h2>Backend</h2>
    <p>The backend handles the computational logic and data management. Key responsibilities include:</p>
    <ul>
      <li><strong>Risk Score Calculation:</strong> Implements a ranking algorithm inspired by PageRank to compute wallet risk scores dynamically.</li>
      <li><strong>Transaction Simulation:</strong> Simulates transactions between wallets, updating balances and recalculating risk scores in real-time.</li>
      <li><strong>Simulation Modes:</strong> Supports two modes:
        <ul>
          <li><strong>Locked Risk:</strong> Prevents risk decay, maintaining strict thresholds.</li>
          <li><strong>Free Risk:</strong> Allows risk scores to decay over time, simulating forgiveness mechanisms.</li>
        </ul>
      </li>
      <li><strong>Data Storage:</strong> Uses MongoDB to store wallet and transaction data, ensuring scalability and efficient retrieval.</li>
    </ul>
  </div>

  <div class="section">
    <h2>Acknowledgments</h2>
    <p>Special thanks to the following tools and technologies used in this project:</p>
    <ul>
      <li><strong>TempoLabs:</strong> Frontend development.</li>
      <li><strong>Cursor:</strong> AI-powered code editor.</li>
      <li><strong>Qwen:</strong> Suggestions and development assistance.</li>
      <li><strong>Etherscan:</strong> Idea of blockchain transactions.</li>
    </ul>
  </div>

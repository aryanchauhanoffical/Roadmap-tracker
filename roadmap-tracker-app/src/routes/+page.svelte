<script>
  import { db } from '$lib/firebase';
  import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
  import { onMount } from 'svelte';
  import { afterUpdate } from 'svelte';
  let showModal = true;
  function closeModal() {
    showModal = false;
  }

  let title = '';
  let description = '';
  let targetDate = '';
  let goals = [];
  let loading = false;
  let editingId = null;
  let editTitle = '';
  let editDescription = '';
  let editTargetDate = '';
  let milestoneInputs = {};
  let streak = 0;
  let lastCompletedDate = '';
  let badges = [];

  async function addGoal() {
    if (!title || !description || !targetDate) return;
    loading = true;
    await addDoc(collection(db, 'goals'), {
      title,
      description,
      targetDate,
      milestones: [],
      created: new Date().toISOString(),
    });
    title = '';
    description = '';
    targetDate = '';
    await fetchGoals();
    loading = false;
    playSound('raven-sound');
  }

  async function fetchGoals() {
    const q = query(collection(db, 'goals'), orderBy('created', 'desc'));
    const snapshot = await getDocs(q);
    goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function startEdit(goal) {
    editingId = goal.id;
    editTitle = goal.title;
    editDescription = goal.description;
    editTargetDate = goal.targetDate;
  }

  async function saveEdit(goalId) {
    if (!editTitle || !editDescription || !editTargetDate) return;
    loading = true;
    await updateDoc(doc(db, 'goals', goalId), {
      title: editTitle,
      description: editDescription,
      targetDate: editTargetDate
    });
    editingId = null;
    await fetchGoals();
    loading = false;
  }

  async function cancelEdit() {
    editingId = null;
  }

  async function deleteGoal(goalId) {
    loading = true;
    await deleteDoc(doc(db, 'goals', goalId));
    await fetchGoals();
    loading = false;
  }

  function milestoneInput(goalId) {
    return milestoneInputs[goalId] || '';
  }

  function setMilestoneInput(goalId, value) {
    milestoneInputs = { ...milestoneInputs, [goalId]: value };
  }

  async function addMilestone(goal) {
    const text = (milestoneInput(goal.id) || '').trim();
    if (!text) return; // Prevent empty milestones
    loading = true;
    const updatedMilestones = [...(goal.milestones || []), { text, done: false }];
    await updateDoc(doc(db, 'goals', goal.id), { milestones: updatedMilestones });
    setMilestoneInput(goal.id, '');
    await fetchGoals();
    loading = false;
  }

  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }

  function updateStreakAndBadges() {
    let completedDates = [];
    let milestoneCount = 0;
    goals.forEach(goal => {
      (goal.milestones || []).forEach(m => {
        if (m.done && m.completedDate) completedDates.push(m.completedDate);
        if (m.done) milestoneCount++;
      });
    });
    completedDates = completedDates.filter(Boolean); // Remove undefined/null
    completedDates = [...new Set(completedDates)].sort();
    streak = 0;
    lastCompletedDate = '';
    if (completedDates.length) {
      let prev = null;
      for (let i = completedDates.length - 1; i >= 0; i--) {
        const date = completedDates[i];
        if (!prev) {
          streak = 1;
          lastCompletedDate = date;
        } else {
          const diff = (new Date(prev) - new Date(date)) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }
        prev = date;
      }
    }
    badges = [];
    if (goals.length > 0) badges.push('🏁 First Goal');
    if (streak >= 3) badges.push('🔥 3-Day Streak');
    if (milestoneCount >= 5) badges.push('⭐ 5 Milestones');
  }

  async function toggleMilestone(goal, idx) {
    loading = true;
    const updatedMilestones = goal.milestones.map((m, i) => {
      if (i === idx) {
        const done = !m.done;
        // Only include completedDate if done, otherwise remove it
        const updated = {
          ...m,
          done
        };
        if (done) {
          updated.completedDate = getToday();
        } else {
          delete updated.completedDate;
        }
        return updated;
      }
      return m;
    });
    await updateDoc(doc(db, 'goals', goal.id), { milestones: updatedMilestones });
    await fetchGoals();
    loading = false;
    playSound && playSound('sword-sound');
  }

  async function removeMilestone(goal, idx) {
    loading = true;
    const updatedMilestones = goal.milestones.filter((_, i) => i !== idx);
    await updateDoc(doc(db, 'goals', goal.id), { milestones: updatedMilestones });
    await fetchGoals();
    loading = false;
  }

  function playSound(id) {
    const audio = document.getElementById(id);
    if (audio) {
      try {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Sound played:', id);
          }).catch(e => {
            console.error('Sound play error:', id, e);
          });
        }
      } catch (e) {
        console.error('Audio error:', id, e);
      }
    } else {
      console.warn('Audio element not found:', id);
    }
  }

  onMount(fetchGoals);

  afterUpdate(() => {
    goals.forEach(goal => {
      const id = `mermaid-${goal.id}`;
      // const diagram = getMermaidDiagram(goal); // Removed Mermaid diagram rendering
      // renderMermaid(id, diagram); // Removed Mermaid diagram rendering
    });
  });

  $: updateStreakAndBadges();
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>

<style>
  body, html, :global(body) {
    min-height: 100vh;
    min-width: 100vw;
    margin: 0;
    padding: 0;
    /* Parchment texture from https://www.transparenttextures.com/ or similar */
    background:
      /* Heraldic SVG overlay */
      url('data:image/svg+xml;utf8,<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><g opacity="0.08"><circle cx="200" cy="200" r="120" fill="gold"/><text x="200" y="220" font-size="80" text-anchor="middle" fill="black" font-family="Cinzel Decorative, serif">⚔️</text></g></svg>') center center no-repeat,
      /* Radial gradient for vignette */
      radial-gradient(ellipse at center, #f8ecd4 60%, #bfa145 90%, #7c5a1e 100%),
      /* Parchment texture */
      url('https://www.transparenttextures.com/patterns/old-mathematics.png');
    background-size: 400px 400px, cover, auto;
    background-attachment: fixed;
    background-blend-mode: multiply, normal, normal;
  }
  .scroll-banner {
    background: linear-gradient(90deg, #222 0%, #333 100%);
    border: 4px solid #bfa145;
    border-radius: 16px;
    margin: 2em auto 1.5em auto;
    padding: 1em 2em;
    max-width: 700px;
    box-shadow: 0 4px 24px #000a;
    text-align: center;
    font-family: 'Cinzel Decorative', serif;
    font-size: 2.2em;
    color: #bfa145;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    position: relative;
  }
  .scroll-banner::before, .scroll-banner::after {
    content: '';
    position: absolute;
    width: 32px;
    height: 32px;
    top: 50%;
    background: #bfa145;
    border-radius: 50%;
    transform: translateY(-50%);
  }
  .scroll-banner::before { left: -40px; }
  .scroll-banner::after { right: -40px; }
  h1 {
    display: none;
  }
  form {
    background: #222;
    padding: 1.5em 2em;
    border-radius: 8px;
    box-shadow: 0 2px 8px #0008;
    margin-bottom: 2em;
    width: 100%;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    border: 1.5px solid #666;
    box-sizing: border-box;
  }
  input[type="text"], input[type="date"], textarea {
    width: 100%;
    padding: 0.5em;
    margin-bottom: 0.5em;
    border: 1.5px solid #666;
    border-radius: 4px;
    font-size: 1em;
    background: #333;
    color: #f5f5f5;
    font-family: 'Merriweather', serif;
    box-sizing: border-box;
  }
  textarea {
    min-height: 60px;
    resize: vertical;
  }
  button {
    background: linear-gradient(90deg, #bfa145 60%, #d32f2f 100%);
    color: #fff;
    border: 2px solid #bfa145;
    border-radius: 8px;
    padding: 0.7em 1.6em;
    font-size: 1.15em;
    font-family: 'Cinzel Decorative', serif;
    font-weight: bold;
    letter-spacing: 0.07em;
    text-shadow: 0 2px 6px #fff, 0 1px 2px #000a;
    cursor: pointer;
    margin-right: 0.5em;
    margin-top: 0.2em;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px #0004;
    position: relative;
  }
  button:disabled {
    background: #666;
    border-color: #666;
    cursor: not-allowed;
  }
  button:hover:not(:disabled) {
    background: linear-gradient(90deg, #d32f2f 60%, #bfa145 100%);
    box-shadow: 0 4px 16px #d32f2f88;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    background: #222;
    margin-bottom: 1.5em;
    padding: 1.2em 1em 1em 1em;
    border-radius: 12px;
    box-shadow: 0 2px 8px #0008;
    border-left: 6px solid #bfa145;
    position: relative;
  }
  .quest-banner {
    font-family: 'Cinzel Decorative', serif;
    color: #bfa145;
    font-size: 1.4em;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.2em;
    display: block;
    font-weight: bold;
    text-shadow: 0 2px 6px #fff8, 0 1px 2px #000a;
  }
  .goal-desc {
    color: #f5f5f5;
    font-size: 1.08em;
    margin-bottom: 0.5em;
    text-shadow: 0 1px 2px #000a;
    font-family: 'Merriweather', serif;
  }
  .milestone-list {
    margin: 0.5em 0 0.5em 0;
    padding-left: 1.5em;
  }
  .milestone-list li {
    background: none;
    box-shadow: none;
    padding: 0.2em 0;
    border-radius: 0;
    margin-bottom: 0.2em;
    display: flex;
    align-items: center;
    color: #f5f5f5;
    font-size: 1em;
  }
  .milestone-list input[type="checkbox"] {
    display: none;
  }
  .shield-checkbox {
    font-size: 1.2em;
    margin-right: 0.5em;
    cursor: pointer;
    user-select: none;
  }
  .dagger-btn {
    background: none;
    border: none;
    color: #d32f2f;
    font-size: 1.2em;
    cursor: pointer;
    margin-left: 0.5em;
    padding: 0;
    vertical-align: middle;
  }
  .badges {
    margin-top: 0.5em;
  }
  .badges span {
    font-size: 1.5em;
    margin-right: 0.5em;
  }
  .mermaid {
    margin-top: 1em;
    background: #191919;
    border-radius: 8px;
    padding: 0.5em;
    overflow-x: auto;
  }
  .section-title {
    font-family: 'Cinzel Decorative', serif;
    color: #bfa145;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 1.3em;
    margin-top: 2em;
    margin-bottom: 0.5em;
  }
  .status-banner {
    background: linear-gradient(90deg, #191919 0%, #222 100%);
    border: 2.5px solid #bfa145;
    border-radius: 12px;
    padding: 0.8em 1.5em;
    margin: 0 auto 2em auto;
    max-width: 400px;
    font-family: 'Cinzel Decorative', serif;
    color: #bfa145;
    font-size: 1.1em;
    letter-spacing: 0.04em;
    box-shadow: 0 2px 8px #0008;
    text-align: left;
  }
  .status-label {
    font-weight: bold;
    color: #bfa145;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-right: 0.3em;
  }
  .status-value {
    color: #f5f5f5;
    font-family: 'Merriweather', serif;
    font-size: 1em;
    letter-spacing: 0.02em;
  }
  .milestone-heading {
    color: #bfa145;
    font-family: 'Cinzel Decorative', serif;
    font-size: 1.08em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.2em;
    text-shadow: 0 2px 6px #fff8, 0 1px 2px #000a;
    display: inline-block;
  }
  .goal-box {
    background: #191919;
    border: 2px solid #bfa145;
    border-radius: 10px;
    padding: 0.7em 1em 0.7em 1em;
    margin-bottom: 0.7em;
    box-shadow: 0 2px 8px #0006;
    display: inline-block;
    min-width: 220px;
    max-width: 95%;
  }
  .goal-title-box {
    background: #191919;
    border: 2.5px solid #bfa145;
    border-radius: 10px;
    padding: 0.6em 1em 0.6em 1em;
    margin-bottom: 0.4em;
    box-shadow: 0 2px 8px #0006;
    display: inline-block;
    min-width: 180px;
    max-width: 95%;
  }
  .goal-desc-box {
    background: #191919;
    border: 2px solid #bfa145;
    border-radius: 8px;
    padding: 0.5em 1em 0.5em 1em;
    margin-bottom: 0.7em;
    box-shadow: 0 1px 4px #0004;
    display: inline-block;
    min-width: 180px;
    max-width: 95%;
  }
  .goal-box-heading {
    color: #bfa145;
    font-family: 'Cinzel Decorative', serif;
    font-size: 1em;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 0.2em;
    text-shadow: 0 2px 6px #fff8, 0 1px 2px #000a;
    display: block;
  }
  .sword-btn {
    position: relative;
    overflow: hidden;
  }
  .sword-icon {
    margin-right: 0.5em;
    font-size: 1.1em;
    transition: transform 0.3s cubic-bezier(.68,-0.55,.27,1.55);
    display: inline-block;
  }
  .sword-btn:hover .sword-icon {
    transform: rotate(-60deg) scale(1.2);
    filter: drop-shadow(0 0 8px #bfa145);
  }
  .shield-checkbox {
    font-size: 1.2em;
    margin-right: 0.5em;
    cursor: pointer;
    user-select: none;
    display: inline-block;
    transition: transform 0.3s cubic-bezier(.68,-0.55,.27,1.55);
  }
  .shield-checkbox.flip {
    animation: shield-flip 0.5s;
  }
  @keyframes shield-flip {
    0% { transform: rotateY(0deg); }
    50% { transform: rotateY(180deg) scale(1.2); }
    100% { transform: rotateY(0deg); }
  }
  .got-modal-overlay {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeInOverlay 1s;
  }
  @keyframes fadeInOverlay {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .got-modal-box {
    background: url('https://www.transparenttextures.com/patterns/old-mathematics.png'), linear-gradient(135deg, #f8ecd4 80%, #bfa145 100%);
    background-blend-mode: multiply;
    padding: 2.2rem 2.5rem 2rem 2.5rem;
    border: 3px solid gold;
    color: gold;
    font-family: 'Cinzel Decorative', serif;
    text-align: center;
    max-width: 600px;
    box-shadow: 0 0 30px #000a;
    border-radius: 14px;
    position: relative;
    animation: fadeInModal 1.2s cubic-bezier(.68,-0.55,.27,1.55);
  }
  @keyframes fadeInModal {
    from { transform: scale(0.8) translateY(40px); opacity: 0; }
    to { transform: scale(1) translateY(0); opacity: 1; }
  }
  .got-modal-emblem {
    font-size: 2.5em;
    margin-bottom: 0.2em;
    text-shadow: 0 0 16px #bfa145, 0 0 8px #fff8;
  }
  .got-modal-title {
    font-family: 'Cinzel Decorative', serif;
    font-size: 2em;
    color: gold;
    margin: 0.2em 0 0.5em 0;
    letter-spacing: 0.08em;
    text-shadow: 0 2px 12px #000, 0 0 8px #bfa145, 0 0 2px #fff8;
  }
  .got-modal-text {
    font-family: 'Merriweather', serif;
    color: #fffbe6;
    font-size: 1.15em;
    margin-bottom: 1.5em;
    text-shadow: 0 2px 10px #000, 0 0 6px #bfa145, 0 0 2px #fff8;
  }
  .got-modal-btn {
    background: linear-gradient(90deg, #bfa145 60%, #d32f2f 100%);
    border: 2.5px solid #bfa145;
    border-radius: 8px;
    padding: 0.7em 2.2em;
    font-size: 1.2em;
    font-family: 'Cinzel Decorative', serif;
    font-weight: bold;
    color: #fffbe6;
    letter-spacing: 0.09em;
    text-shadow: 0 2px 6px #fff8, 0 1px 2px #000a;
    cursor: pointer;
    box-shadow: 0 2px 8px #0004;
    transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
    margin-top: 0.5em;
  }
  .got-modal-btn:hover {
    background: linear-gradient(90deg, #d32f2f 60%, #bfa145 100%);
    box-shadow: 0 4px 16px #d32f2f88;
    transform: scale(1.07) rotate(-2deg);
  }
</style>

<div class="scroll-banner">⚔️ Road to the Throne: Track Your Destiny</div>
<h1>Roadmap Tracker: Add a Learning Goal</h1>
<div class="status-banner">
  <span class="status-label">Streak:</span> <span class="status-value">{streak} day{streak === 1 ? '' : 's'}</span>
  <br />
  <span class="status-label">Badges:</span>
  <span class="badges">
    {#if badges.length === 0}
      <span class="status-value">None yet</span>
    {:else}
      {#each badges as badge}
        <span>{badge}</span>
      {/each}
    {/if}
  </span>
</div>
<form on:submit|preventDefault={addGoal}>
  <input type="text" placeholder="Goal Title" bind:value={title} required />
  <br />
  <textarea placeholder="Description" bind:value={description} required></textarea>
  <br />
  <input type="date" bind:value={targetDate} required />
  <br />
  <button type="submit" disabled={loading} class="sword-btn">
    <i class="fas fa-sword sword-icon"></i> {loading ? 'Adding...' : 'Add Goal'}
  </button>
</form>

<h2 class="section-title">Your Quest Log</h2>
{#if goals.length === 0}
  <p>No goals yet. Add one above!</p>
{:else}
  <ul>
    {#each goals as goal}
      <li>
        {#if editingId === goal.id}
          <input type="text" bind:value={editTitle} required />
          <br />
          <textarea bind:value={editDescription} required></textarea>
          <br />
          <input type="date" bind:value={editTargetDate} required />
          <br />
          <button on:click={() => saveEdit(goal.id)} disabled={loading}>Save</button>
          <button on:click={cancelEdit} disabled={loading}>Cancel</button>
        {:else}
          <div class="goal-title-box">
            <span class="goal-box-heading">Goal:</span>
            <span class="quest-banner">{goal.title} <span style="color:#f5f5f5; font-size:0.8em;">(Target: {goal.targetDate})</span></span>
          </div>
          <div class="goal-desc-box">
            <span class="goal-box-heading">Description:</span>
            <span class="goal-desc">{goal.description}</span>
          </div>
          <br />
          <button on:click={() => startEdit(goal)} disabled={loading}>Edit</button>
          <button on:click={() => deleteGoal(goal.id)} disabled={loading}>Delete</button>
          <br />
          <div style="margin-top: 0.5em;">
            <span class="milestone-heading">Milestones:</span>
            <ul class="milestone-list">
              {#each goal.milestones || [] as milestone, idx}
                {#if milestone.text && milestone.text.trim() !== ''}
                  <li>
                    <span class="shield-checkbox {milestone.flip ? 'flip' : ''}" on:click={() => toggleMilestone(goal, idx)}>
                      <i class="fas fa-shield-halved"></i>
                    </span>
                    <span style="text-decoration: {milestone.done ? 'line-through' : 'none'}">{milestone.text}</span>
                    <button class="dagger-btn" on:click={() => removeMilestone(goal, idx)} disabled={loading} title="Remove">🗡️</button>
                  </li>
                {/if}
              {/each}
            </ul>
            <input type="text" placeholder="Add milestone" bind:value={milestoneInputs[goal.id]} on:input={e => setMilestoneInput(goal.id, e.target.value)} />
            <button on:click={() => addMilestone(goal)} disabled={loading}>Add Milestone</button>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

{#if showModal}
  <div class="got-modal-overlay">
    <div class="got-modal-box">
      <div class="got-modal-emblem">⚔️</div>
      <h2 class="got-modal-title">Hail, Brave Soul!</h2>
      <p class="got-modal-text">Your quest begins here. Track your destiny and earn your rightful place on the throne.</p>
      <button class="got-modal-btn" on:click={closeModal}>Begin Your Quest</button>
    </div>
  </div>
{/if}

<script lang="ts">
	const states = [' ', '❓', '⭕', '❌'];
	let currentState = 0;

	function next() {
		currentState++;
		currentState %= states.length;
	}
</script>

<button class="click hide-on-print" on:click={() => next()}>
	<div>
		{states[currentState]}
	</div>
</button>

<style lang="scss">
	.click {
        background-color: transparent;
        border: 1px solid transparent;
        padding: 0px;
		font-size: 100%;
		display: grid;
		justify-items: center;
		align-items: center;
		width: 100%;
		height: 100%;

        &:hover{
            border: 1px solid var(--character-background-color);
        }
        &:active{
            background-color: var(--character-background-color);
        }
	}

	:global(.touchTarget) .click {
		font-size: large;
		min-width: 2rem;
		min-height: 2rem;
	}
</style>

export default function Status({ connectionState }) {

	const connectionString = connectionState !== WebSocket.OPEN ? "not connected" : "connected";

	return <h2>You&apos;re {connectionString}</h2>
}

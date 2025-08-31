export default function NumberInput({
  numbersInput,
  setNumbersInput,
  onAddNumber,
}) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddClick();
    }
  };

  const handleAddClick = () => {
    const num = parseInt(numbersInput);
    if (!isNaN(num) && num >= 0 && num <= 36) {
      onAddNumber(num);
      setNumbersInput("");
    }
  };

  return (
    <div className="flex w-full max-w-md shadow rounded overflow-hidden">
      <input
        type="number"
        min="0"
        max="36"
        placeholder="Enter a number (0-36)"
        value={numbersInput}
        onChange={(e) => setNumbersInput(e.target.value)}
        onKeyDown={handleKeyPress}
        className="flex-1 p-2 border border-gray-300 outline-none"
      />
      <button
        onClick={handleAddClick}
        className="px-4 bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        Add
      </button>
    </div>
  );
}

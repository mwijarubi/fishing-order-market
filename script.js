const orderForm = document.getElementById("orderForm");

if (orderForm) {
    const fishOptions = Array.from(orderForm.querySelectorAll(".fish-option"), (element) => ({
        element,
        checkbox: element.querySelector(".fish-checkbox"),
        quantityInput: element.querySelector(".fish-quantity-input")
    }));
    const totalDisplay = document.getElementById("total");
    const orderSummary = document.getElementById("orderSummary");
    const confirmation = document.getElementById("confirmation");
    const currency = new Intl.NumberFormat("en-TZ");

    function getSelectedFish() {
        return fishOptions
            .filter(({ checkbox }) => checkbox.checked)
            .map(({ checkbox, quantityInput }) => ({
                name: checkbox.value,
                pricePerKg: Number(checkbox.dataset.price),
                quantity: Number(quantityInput.value)
            }));
    }

    function calculateTotal() {
        const selectedFish = getSelectedFish();
        const total = selectedFish.reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0);
        const totalQuantity = selectedFish.reduce((sum, item) => sum + item.quantity, 0);

        totalDisplay.textContent = currency.format(total);
        orderSummary.textContent = selectedFish.length
            ? `${selectedFish.length} ${selectedFish.length === 1 ? "variety" : "varieties"} · ${totalQuantity} kg selected`
            : "Choose one or more fish";
    }

    const requestedFish = new URLSearchParams(window.location.search).get("fish");
    for (const { element, checkbox, quantityInput } of fishOptions) {
        checkbox.checked = checkbox.value === requestedFish;
        quantityInput.disabled = !checkbox.checked;
        element.classList.toggle("is-selected", checkbox.checked);

        checkbox.addEventListener("change", () => {
            quantityInput.disabled = !checkbox.checked;
            element.classList.toggle("is-selected", checkbox.checked);
            confirmation.textContent = "";
            calculateTotal();
        });
        quantityInput.addEventListener("input", calculateTotal);
    }
    calculateTotal();

    orderForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const selectedFish = getSelectedFish();
        if (selectedFish.length === 0) {
            confirmation.textContent = "Please choose at least one fish for your order.";
            fishOptions[0].checkbox.focus();
            return;
        }

        const total = selectedFish.reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0);
        const orderMessage = [
            "🐟 NEW FISH ORDER",
            "",
            `Customer Name: ${document.getElementById("name").value}`,
            `Customer Phone: ${document.getElementById("phone").value}`,
            "",
            "Fish:",
            ...selectedFish.map((item) =>
                `• ${item.name}: ${item.quantity} kg × TSh ${currency.format(item.pricePerKg)} = TSh ${currency.format(item.pricePerKg * item.quantity)}`
            ),
            `TOTAL: TSh ${currency.format(total)}`,
            "",
            `Delivery Location: ${document.getElementById("location").value}`,
            "",
            `Additional Message: ${document.getElementById("message").value || "None"}`
        ].join("\n");
        const whatsappNumber = "255742973884";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderMessage)}`;

        window.location.assign(whatsappUrl);
    });
}

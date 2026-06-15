export const formatPrice = (price) =>
  Number(price || 0).toLocaleString();

export const normalizeProduct = (product) => ({
  ...product,
  id: product.id,
  title: product.title || product.name,
  name: product.name || product.title,
  price: typeof product.price === "number" ? formatPrice(product.price) : String(product.price || "0"),
  image: product.image,
  description: product.description,
  is_available: product.is_available === false || product.is_available === 0 || product.is_available === "0" ? false : Boolean(product.is_available),
  unavailable_message: product.unavailable_message || "",
  is_featured: Boolean(product.is_featured),
});

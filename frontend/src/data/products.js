import ProductOne from "../assets/bloom-product(1).jpeg";
import ProductTwo from "../assets/bloom-product(2).jpeg";
import ProductThree from "../assets/bloom-product(3).jpeg";
import ProductFour from "../assets/bloom-product(4).jpeg";
import ComboSpecial from "../assets/combo-special.jpeg";

export const products = [

  { id: 1, title: "Protein Powder", price: "20,000", image: ProductOne },
  { id: 2, title: "Protein Oats", price: "18,000", image: ProductTwo },
  { id: 3, title: "Tummy Shrink Tea", price: "18,000", image: ComboSpecial },
  { id: 4, title: "Booty Gummies", price: "25,000", image: ProductThree },
  { id: 5, title: "Nutrivia Gummies", price: "20,000", image: ProductFour },
];

export const getProductById = (id) =>
  products.find((product) => product.id === Number(id)) || products[0];

import { products } from "../../data/data";
import { Section } from "../../styles/styles";
import Title from "../common/Title";
import ProductList from "./ProductList";

const ProductSimilar = ({relatedProducts}) => {
  return (
    <Section>
      <Title titleText={"Similar Products"} />
      <ProductList products={relatedProducts} />
    </Section>
  );
};

export default ProductSimilar;

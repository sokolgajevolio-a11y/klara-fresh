import { scanProduct } from "./scanProduct";
import { scanCollection } from "./scanCollection";

export function backgroundScan({ resourceType, data }) {
  switch (resourceType) {
    case "product":
      return scanProduct(data);

    case "collection":
      return scanCollection(data);

    default:
      return [];
  }
}

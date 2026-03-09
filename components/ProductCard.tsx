import { IProduct } from "@/lib/models/Product";

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <a
      href={product.Product_Url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 no-underline"
    >
      {product.is_special === 1 && (
        <span className="inline-block bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded mb-2">
          On Special
        </span>
      )}
      <h3 className="text-gray-900 font-semibold text-sm leading-tight mb-1">
        {product.Product_Name || "Unknown Product"}
      </h3>
      {product.Brand && (
        <p className="text-gray-500 text-xs mb-2">{product.Brand}</p>
      )}
      <div className="flex items-baseline gap-2 flex-wrap">
        {product.Package_price != null && (
          <span className="text-atlas font-bold">
            ${product.Package_price.toFixed(2)}
          </span>
        )}
        {product.package_size && (
          <span className="text-gray-400 text-xs">{product.package_size}</span>
        )}
        {product.Price_per_unit && (
          <span className="text-gray-400 text-xs">
            ({product.Price_per_unit})
          </span>
        )}
      </div>
    </a>
  );
}

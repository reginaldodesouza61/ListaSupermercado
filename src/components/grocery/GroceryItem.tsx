import React, { useState } from 'react';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { GroceryItem } from '../../types';
import { useGroceryStore } from '../../store/groceryStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency, calculateTotalPrice } from '../../lib/utils';

interface GroceryItemProps {
  item: GroceryItem;
}

export const GroceryItemRow: React.FC<GroceryItemProps> = ({ item }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(item.product);
  const [editedQuantity, setEditedQuantity] = useState(item.quantity);
  const [editedUnitPrice, setEditedUnitPrice] = useState(item.unitPrice);

  const { togglePurchased, updateItem, deleteItem } = useGroceryStore();

  const handleTogglePurchased = () => {
    togglePurchased(item.id, !item.purchased);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem(item.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProduct(item.product);
    setEditedQuantity(item.quantity);
    setEditedUnitPrice(item.unitPrice);
  };

  const handleSaveEdit = async () => {
    await updateItem(item.id, {
      product: editedProduct,
      quantity: editedQuantity,
      unitPrice: editedUnitPrice,
      totalPrice: calculateTotalPrice(editedQuantity, editedUnitPrice)
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <Input
            value={editedProduct}
            onChange={(e) => setEditedProduct(e.target.value)}
            fullWidth
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <Input
            type="number"
            min="1"
            value={editedQuantity}
            onChange={(e) => setEditedQuantity(Number(e.target.value))}
            fullWidth
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={editedUnitPrice}
            onChange={(e) => setEditedUnitPrice(Number(e.target.value))}
            fullWidth
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatCurrency(calculateTotalPrice(editedQuantity, editedUnitPrice))}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center space-x-2">
            <Button
              variant="success"
              size="sm"
              onClick={handleSaveEdit}
            >
              <Check size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
            >
              <X size={16} />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className={item.purchased ? 'bg-green-50' : ''}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={item.purchased}
            onChange={handleTogglePurchased}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <span 
            className={`ml-3 ${item.purchased ? 'line-through text-gray-500' : ''}`}
          >
            {item.product}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.quantity}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatCurrency(item.unitPrice)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatCurrency(item.totalPrice)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEdit}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
};
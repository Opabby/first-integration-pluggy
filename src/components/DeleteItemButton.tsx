import { useState } from "react";
import {
  Button,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  DialogActionTrigger,
  Text,
} from "@chakra-ui/react";
import { toaster } from "../components/ui/toaster";
import { pluggyApi } from "../services/pluggyApi";

interface DeleteItemButtonProps {
  itemId: string;
  itemName?: string;
  onDeleteSuccess?: () => void;
  variant?: "solid" | "outline" | "ghost";
  colorScheme?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export const DeleteItemButton = ({
  itemId,
  itemName,
  onDeleteSuccess,
  variant = "outline",
  colorScheme = "red",
  size = "sm",
}: DeleteItemButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await pluggyApi.deleteItem(itemId);
      
      toaster.create({
        title: "Item deleted successfully",
        description: response.warnings && response.warnings.length > 0
          ? `Note: ${response.warnings.join(", ")}`
          : "Item and all related data have been removed",
        type: "success",
        duration: 5000,
      });

      setIsOpen(false);
      
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      
      toaster.create({
        title: "Failed to delete item",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          colorScheme={colorScheme}
          size={size}
        >
          Delete
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Text>
            Are you sure you want to delete {itemName ? `"${itemName}"` : "this item"}?
          </Text>
          <Text mt={2} color="gray.600" fontSize="sm">
            This will permanently delete:
          </Text>
          <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li>The item from Pluggy</li>
            <li>All associated accounts</li>
            <li>All identity information</li>
            <li>All related data from your database</li>
          </ul>
          <Text mt={3} color="red.500" fontSize="sm" fontWeight="semibold">
            This action cannot be undone.
          </Text>
        </DialogBody>

        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            loading={isDeleting}
            loadingText="Deleting..."
          >
            Delete Item
          </Button>
        </DialogFooter>

        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};
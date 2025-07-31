"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material";
import { OrderDTO } from "@/app/models/order_dto";

type SplitMainOption = "total" | "split";

type SplitSubOption = "nPeople" | "percentage" | "amount" | "products";

interface SplitConfig {
  people: number;
  percentage: number;
  amount: number;
  selectedItems: number[];
  subOption?: SplitSubOption;
}

interface SplitTheBillDialogProps {
  open: boolean;
  orders: OrderDTO[];
  onClose: () => void;
  onSubmit: (splitOption: "total" | "nPeople" | "percentage" | "amount" | "products", config: SplitConfig) => void;
}

export const SplitTheBillDialog: React.FC<SplitTheBillDialogProps> = ({
  open,
  orders,
  onClose,
  onSubmit,
}) => {
  const [mainOption, setMainOption] = useState<SplitMainOption>("total");

  const [subOption, setSubOption] = useState<SplitSubOption>("nPeople");

  const [config, setConfig] = useState<SplitConfig>({
    people: 2,
    percentage: 50,
    amount: 0,
    selectedItems: [],
    subOption: "nPeople",
  });

  const totalAmount = orders
    .filter((o) => o.status === "confirmed")
    .reduce((sum, order) => {
      return (
        sum +
        order.items.reduce((itemSum, item) => {
          const base = Number(item.product.price);
          const extras =
            item.selectedOptions?.reduce((total, opt) => {
              return (
                total +
                opt.values.reduce((sumVal, val) => sumVal + Number(val.price), 0)
              );
            }, 0) ?? 0;
          return itemSum + (base + extras) * item.quantity;
        }, 0)
      );
    }, 0);

  const calculateCurrentAmount = (): number => {
    if (mainOption === "total") return totalAmount;

    switch (config.subOption) {
      case "nPeople":
        return totalAmount / Math.max(1, config.people);

      case "percentage":
        return (totalAmount * config.percentage) / 100;

      case "amount":
        return config.amount;

      case "products":
        const selectedItemIds = new Set(config.selectedItems);
        return orders.reduce((sumOrders, order) => {
          if (order.status !== "confirmed") return sumOrders;
          const orderSum = order.items.reduce((sumItems, item) => {
            if (!selectedItemIds.has(Number(item.id))) return sumItems;
            const base = Number(item.product.price);
            const extras =
              item.selectedOptions?.reduce((total, opt) => {
                return (
                  total +
                  opt.values.reduce((sumVal, val) => sumVal + Number(val.price), 0)
                );
              }, 0) ?? 0;
            return sumItems + (base + extras) * item.quantity;
          }, 0);
          return sumOrders + orderSum;
        }, 0);

      default:
        return totalAmount;
    }
  };

  useEffect(() => {
    setConfig((prev) => ({ ...prev, subOption }));
  }, [subOption]);

  useEffect(() => {
    if (!open) {
      setMainOption("total");
      setSubOption("nPeople");
      setConfig({
        people: 2,
        percentage: 50,
        amount: 0,
        selectedItems: [],
        subOption: "nPeople",
      });
    }
  }, [open]);

  const toggleSelectedItem = (itemId: number) => {
    setConfig((prev) => {
      const newSelected = new Set(prev.selectedItems);
      if (newSelected.has(itemId)) newSelected.delete(itemId);
      else newSelected.add(itemId);
      return { ...prev, selectedItems: Array.from(newSelected) };
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Repartir el pago</DialogTitle>

      <DialogContent>
        <Typography variant="h6" mb={2}>
          Total a pagar: ${totalAmount.toFixed(2)}
        </Typography>

        <Box mb={3}>
          <FormControl fullWidth>
            <InputLabel id="main-option-label">¿Cómo deseas pagar?</InputLabel>
            <Select
              labelId="main-option-label"
              value={mainOption}
              label="¿Cómo deseas pagar?"
              onChange={(e) => setMainOption(e.target.value as SplitMainOption)}
            >
              <MenuItem value="total">Pagar la totalidad de la cuenta</MenuItem>
              <MenuItem value="split">Repartir la cuenta</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {mainOption === "split" && (
          <>
            <Box mb={3}>
              <FormControl fullWidth>
                <InputLabel id="sub-option-label">Selecciona cómo repartir</InputLabel>
                <Select
                  labelId="sub-option-label"
                  value={subOption}
                  label="Selecciona cómo repartir"
                  onChange={(e) => setSubOption(e.target.value as SplitSubOption)}
                >
                  <MenuItem value="nPeople">Repartir entre n personas</MenuItem>
                  <MenuItem value="percentage">Repartir según un porcentaje</MenuItem>
                  <MenuItem value="amount">Repartir según un monto específico</MenuItem>
                  <MenuItem value="products">Pagar ciertos productos</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {subOption === "nPeople" && (
              <TextField
                label="Cantidad de personas"
                type="number"
                inputProps={{ min: 1 }}
                value={config.people}
                onChange={(e) =>
                  setConfig({ ...config, people: Math.max(1, Number(e.target.value)) })
                }
                fullWidth
                margin="normal"
              />
            )}

            {subOption === "percentage" && (
              <TextField
                label="Porcentaje a pagar (%)"
                type="number"
                inputProps={{ min: 1, max: 100 }}
                value={config.percentage}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    percentage: Math.min(100, Math.max(1, Number(e.target.value))),
                  })
                }
                fullWidth
                margin="normal"
              />
            )}

            {subOption === "amount" && (
              <TextField
                label="Monto a pagar ($)"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={config.amount}
                onChange={(e) =>
                  setConfig({ ...config, amount: Number(e.target.value) || 0 })
                }
                fullWidth
                margin="normal"
              />
            )}

            {subOption === "products" && (
              <Box maxHeight={200} overflow="auto" border="1px solid #ccc" p={1} borderRadius={1}>
                {orders.flatMap((order) =>
                  order.items.map((item) => (
                    <Box key={item.id} display="flex" alignItems="center" mb={1}>
                      <input
                        type="checkbox"
                        checked={config.selectedItems.includes(Number(item.id))}
                        onChange={() => toggleSelectedItem(Number(item.id))}
                        style={{ marginRight: 8 }}
                      />
                      <Typography>
                        {item.product.name} x{item.quantity}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            )}

            <Typography mt={2} fontWeight="bold">
              Monto actual a pagar: ${calculateCurrentAmount().toFixed(2)}
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button
          onClick={() => {
            if (mainOption === "total") {
              onSubmit("total", config);
            } else {
              onSubmit(subOption!, config);
            }
          }}
          variant="contained"
          color="primary"
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

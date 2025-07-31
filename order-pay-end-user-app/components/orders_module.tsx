"use client";
import {
  Box,
  IconButton,
  List,
  ListItem,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ListItemText,
  List as MUIList,
  DialogContentText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, { useEffect, useState } from "react";
import { OrderDTO } from "@/app/models/order_dto";
import { SplitTheBillDialog } from "./split_the_bill_dialog";

interface OrdersModuleProps {
  apiBaseUrl: string;
  onBack: () => void;
}

export const OrdersModule: React.FC<OrdersModuleProps> = ({
  apiBaseUrl,
  onBack,
}) => {
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [open, setOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [finalPaymentOpen, setFinalPaymentOpen] = useState(false);
  const [splitAmount, setSplitAmount] = useState<number | null>(null);

  async function loadOrders() {
    if (ordersLoading) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/orders`);
      if (!res.ok) throw new Error("Error al obtener órdenes");
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
      alert("No se pudieron cargar las órdenes.");
    } finally {
      setOrdersLoading(false);
    }
  }

  const handleConfirmOrders = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/table-sessions/1/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Error al confirmar ordenes");

      // TODO: ADD TOAST NOTIFICATION
    } catch (e) {
      console.error(e);
      alert("No se pudo confirmar las órdenes.");
    } finally {
      setOpen(false);
      loadOrders();
    }
  };

  const handlePayment = async (method: "mercadopago" | "presencial", amount: number | null) => {
    console.log("Handling payment");
    console.log(amount);
    console.log(method);
    if (!amount) {
      alert("Monto inválido para el pago.");
      return;
    }
    try {
      if (method === "presencial") {
        alert(`Pago presencial seleccionado. Total a pagar: $${amount.toFixed(2)}`);
        console.log(amount);
        return;
      }

      const confirmedOrders = orders?.filter((o: any) => o.status === "confirmed") ?? [];

      const productMap = new Map<string, number>();
      confirmedOrders.forEach((order: any) => {
        order.items.forEach((item: any) => {
          const name = item.product.name;
          const qty = item.quantity;
          productMap.set(name, (productMap.get(name) ?? 0) + qty);
        });
      });

      const description = Array.from(productMap.entries())
        .map(([name, qty]) => `x${qty} ${name}`)
        .join(", ");

      let frontendUrl = window.location.origin;
      if (frontendUrl.includes("localhost")) {
        frontendUrl = "https://thetabbie.com";
      }

      const body = JSON.stringify({
        sessionId: 1, // TODO: Cambiar por el ID de la sesión de mesa actual
        amount,
        description,
        currency: "UYU",
        successUrl: `${frontendUrl}/payment/success`,
        failureUrl: `${frontendUrl}/payment/failure`,
        pendingUrl: `${frontendUrl}/payment/pending`
      });

      const res = await fetch(`${apiBaseUrl}/payments/mercadopago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body
      });

      const data = await res.json();
      if (!res.ok || !data.init_point) throw new Error("Error al crear el checkout");

      window.location.href = data.init_point;
    } catch (e) {
      console.error(e);
      alert("No se pudo iniciar el pago con MercadoPago.");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <Box width="100%" maxWidth="md" p={2} alignSelf="flex-start">
      <IconButton onClick={onBack} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h6" textAlign="center" fontWeight="bold" mb={2}>
        Órdenes de la Mesa 1
      </Typography>

      {ordersLoading && (
        <Typography color="text.secondary">Cargando órdenes...</Typography>
      )}

      {!ordersLoading && orders && orders.length === 0 && (
        <Typography color="text.secondary">No hay órdenes para mostrar.</Typography>
      )}

      {!ordersLoading && orders && orders.length > 0 && (
        <>
          <List disablePadding>
            {orders.map((order: any) => {
              const total = order.items.reduce((sum: any, item: any) => {
                const base = Number(item.product.price);
                const extras =
                  item.selectedOptions?.reduce((total: any, opt: any) => {
                    return (
                      total +
                      opt.values.reduce(
                        (sum: any, val: any) => sum + Number(val.price),
                        0
                      )
                    );
                  }, 0) ?? 0;
                return sum + (base + extras) * item.quantity;
              }, 0);

              return (
                <ListItem
                  component="button"
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    mb: 2,
                    p: 2,
                    boxShadow: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body1">
                      <strong>Productos:</strong>{" "}
                      {order.items.map((i: any) => i.product.name).join(", ")}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cantidad total:</strong>{" "}
                      {order.items.reduce(
                        (sum: any, i: any) => sum + i.quantity,
                        0
                      )}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Estado:</strong>{" "}
                      {(() => {
                        switch (order.status) {
                          case "pending":
                            return "Pendiente";
                          case "confirmed":
                            return "Confirmada";
                          case "cancelled":
                            return "Cancelada";
                          case "paid":
                            return "Pagada";
                          default:
                            return order.status;
                        }
                      })()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    ${total}
                  </Typography>
                </ListItem>
              );
            })}
          </List>

          <Box textAlign="center" mt={3}>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
              Confirmar Órdenes
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle>Confirmar Órdenes</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Las órdenes confirmadas serán enviadas a la cocina para ser preparadas.
                  ¿Estás seguro de que deseas continuar?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)} color="secondary">
                  Cancelar
                </Button>
                <Button onClick={handleConfirmOrders} color="primary" variant="contained">
                  Continuar
                </Button>
              </DialogActions>
            </Dialog>
          </Box>

          <Box textAlign="center" mt={3}>
            <Button
              variant="contained"
              color="success"
              onClick={() => setPaymentModalOpen(true)}
            >
              Pagar Órdenes Confirmadas
            </Button>

            <SplitTheBillDialog
  open={paymentModalOpen}
  orders={orders ?? []}
  onClose={() => setPaymentModalOpen(false)}
  onSubmit={(splitOption, config) => {
    setPaymentModalOpen(false);

    let totalSplitAmount = 0;

    switch (splitOption) {
      case "total":
        totalSplitAmount = (orders ?? [])
          .filter(o => o.status === "confirmed")
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
        break;

      case "nPeople":
        const totalConfirmed = (orders ?? [])
          .filter(o => o.status === "confirmed")
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

        totalSplitAmount = totalConfirmed / Math.max(1, config.people);
        break;

      case "percentage":
        const totalConfirmedPercentage = (orders ?? [])
          .filter(o => o.status === "confirmed")
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

        totalSplitAmount = (totalConfirmedPercentage * config.percentage) / 100;
        break;

      case "amount":
        totalSplitAmount = config.amount;
        break;

      case "products":
        const selectedItemIds = new Set(config.selectedItems);

        totalSplitAmount = (orders ?? [])
          .filter(o => o.status === "confirmed")
          .reduce((sum, order) => {
            const orderSum = order.items.reduce((itemSum, item) => {
              if (!selectedItemIds.has(Number(item.id))) return itemSum;

              const base = Number(item.product.price);
              const extras =
                item.selectedOptions?.reduce((total, opt) => {
                  return (
                    total +
                    opt.values.reduce((sumVal, val) => sumVal + Number(val.price), 0)
                  );
                }, 0) ?? 0;
              return itemSum + (base + extras) * item.quantity;
            }, 0);
            return sum + orderSum;
          }, 0);
        break;
    }

    setSplitAmount(totalSplitAmount);
    setFinalPaymentOpen(true);
  }}
/>

            <Dialog
              open={finalPaymentOpen}
              onClose={() => setFinalPaymentOpen(false)}
              maxWidth="xs"
              fullWidth
            >
              <DialogTitle>Elegir método de pago</DialogTitle>
              <DialogContent>
                <Typography variant="h6" textAlign="center" mb={2}>
                  Total a pagar: ${splitAmount?.toFixed(2)}
                </Typography>
                <DialogContentText>
                  Por favor selecciona cómo deseas pagar las órdenes confirmadas.
                </DialogContentText>
              </DialogContent>
              <DialogActions sx={{ flexDirection: "column", alignItems: "stretch", gap: 1, p: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setFinalPaymentOpen(false);
                    handlePayment("presencial", splitAmount);
                  }}
                >
                  Pago presencial
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setFinalPaymentOpen(false);
                    handlePayment("mercadopago", splitAmount);
                  }}
                >
                  Pagar con MercadoPago
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </>
      )}

      <Dialog
        open={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalles de la Orden</DialogTitle>
        <DialogContent dividers>
          {selectedOrder?.items.map((item) => {
            const basePrice = Number(item.product.price);
            const optionsExtra =
              item.selectedOptions?.reduce((total, opt) => {
                return (
                  total +
                  opt.values.reduce(
                    (sum, val) => sum + Number(val.price),
                    0
                  )
                );
              }, 0) ?? 0;

            const itemTotalPrice = (basePrice + optionsExtra) * item.quantity;

            return (
              <Box key={item.id} mb={3}>
                <Typography variant="body1">
                  <strong>Producto:</strong> {item.product.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Cantidad:</strong> {item.quantity}
                </Typography>
                <Typography variant="body2">
                  <strong>Precio total:</strong> ${itemTotalPrice}
                </Typography>
                {item.note && (
                  <Typography variant="body2">
                    <strong>Nota:</strong> {item.note}
                  </Typography>
                )}
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <Box ml={2} mt={1}>
                    {item.selectedOptions.map((opt: any) => (
                      <Box key={opt.id} mb={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {opt.productOption.name}:
                        </Typography>
                        <MUIList dense disablePadding>
                          {opt.values.map((val: any) => (
                            <ListItem key={val.id} disablePadding>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {val.description} — ${val.price}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </MUIList>
                      </Box>
                    ))}
                  </Box>
                )}
                <Divider sx={{ mt: 2 }} />
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

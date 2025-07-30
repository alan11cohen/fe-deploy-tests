"use client";
import { CreateOrderDTO } from "@/app/models/create_order_dto";
import { Product } from "@/app/models/product";
import { ProductOption } from "@/app/models/product_option";
import { Restaurant } from "@/app/restaurants/restaurant";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Checkbox,
  Radio,
  FormGroup,
  FormControlLabel,
  Stack,
  CircularProgress,
  IconButton,
  List,
  Dialog,
  DialogTitle,
  DialogContent,
  ListItem,
  ListItemText,
  DialogActions,
  Divider,
} from "@mui/material";
import EcoIcon from "@mui/icons-material/Spa";
import NoMealsIcon from "@mui/icons-material/NoMeals";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { TableSession } from "@/app/models/table_session";
import { OrdersModule } from "./orders_module";

interface MenuModuleProps {
  restaurantId: number;
  apiBaseUrl?: string;
}

export const MenuModule: React.FC<MenuModuleProps> = ({
  restaurantId,
  apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
}) => {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [productsLoading, setLoadingMenu] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [singleSelections, setSingleSelections] = useState<
    Record<number, number>
  >({});
  const [multiSelections, setMultiSelections] = useState<
    Record<number, number[]>
  >({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [tableSessionId, setTableSessionId] = useState<number>();

  const textAreaMaxLength = 250;
  var finalPrice = 0;

  async function loadRestaurant() {
    try {
      const res = await fetch(`${apiBaseUrl}/restaurants/${restaurantId}`);
      if (!res.ok) throw new Error("Error al obtener restaurante");
      const data: Restaurant = await res.json();
      setRestaurant(data);
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar el restaurante.");
    }
  }

  async function loadMenu() {
    if (productsLoading || products?.length) return;
    setLoadingMenu(true);
    try {
      const res = await fetch(
        `${apiBaseUrl}/restaurants/${restaurantId}/products`
      );
      if (!res.ok) throw new Error("Error al obtener productos");
      const data: Product[] = await res.json();
      setProducts(data.filter((p) => !p.hide));
    } catch (e) {
      console.error(e);
      alert("No se pudieron cargar los productos.");
    } finally {
      setLoadingMenu(false);
    }
  }

  async function initializeSession() {
    const tableId = 1; //TODO: Obtener del QR

    //TODO: Si entra un nuevo usuario, sumarlo a la lista
    const res = await fetch(`${apiBaseUrl}/table-sessions/active-by-table-id/${tableId}`);
      if (!res.ok){
      try {
        const res = await fetch(`${apiBaseUrl}/table-sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tableId, restaurantId }),
        });

        if (!res.ok) throw new Error("Error al crear sesión");

        const data: TableSession = await res.json();

        sessionStorage.setItem("tableSessionId", data.id.toString());
        setTableSessionId(data.id);
        console.log("Session created with ID:", data.id);
      } catch (e) {
        console.error(e);
        alert("No se pudo crear la sesión de la mesa. Aún así puedes observar el menú.");
      }
    }

    const data: TableSession = await res.json();
    setTableSessionId(data.id);
  }

  function selectSingleOption(optionId: number, valueId: number) {
    setSingleSelections((prev) => ({
      ...prev,
      [optionId]: valueId,
    }));
  }

  function toggleCheckbox(option: ProductOption, valueId: number) {
    setMultiSelections((prev) => {
      const current = prev[option.id] ?? [];
      const isChecked = current.includes(valueId);
      let next: number[];
      if (isChecked) {
        next = current.filter((id) => id !== valueId);
      } else {
        if (current.length >= option.limit) return prev;
        next = [...current, valueId];
      }
      return { ...prev, [option.id]: next };
    });
  }

  const isChecked = (optionId: number, valueId: number) =>
    (multiSelections[optionId] ?? []).includes(valueId);

  useEffect(() => {
    loadRestaurant();
    loadMenu();
    initializeSession();
  }, []);

  if (viewingOrder) {
    return (
      <OrdersModule
        apiBaseUrl={apiBaseUrl}
        onBack={() => setViewingOrder(false)}
      />
    );
  }


  const groupedByCategory = products?.reduce<Record<string, Product[]>>(
    (acc, product) => {
      const key = product.category ?? "Otros";
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    },
    {}
  );

  if (!selected) {
    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          mx: "auto",
          p: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
        }}
      >
        {!products && (
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={loadMenu}
            disabled={productsLoading}
            sx={{ mb: 3 }}
          >
            {productsLoading ? <CircularProgress size={24} /> : "Menú"}
          </Button>
        )}

        {restaurant?.imageUrl && products && (
          <Box
            sx={{
              position: "relative",
              mb: 3,
              borderRadius: 2,
              overflow: "hidden",
              height: 160,
            }}
          >
            <CardMedia
              component="img"
              image={restaurant.imageUrl}
              alt={restaurant.name}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                bgcolor: "rgba(0,0,0,0.6)",
                color: "white",
                p: 1,
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {restaurant.name}
              </Typography>
            </Box>
          </Box>
        )}

        <Stack spacing={4} sx={{ maxHeight: "60vh", overflowY: "auto" }}>
          {groupedByCategory &&
            Object.entries(groupedByCategory).map(([category, items]) => (
              <Box key={category}>
                <Typography
                  variant="h6"
                  gutterBottom
                  className="text-black font-bold"
                >
                  {category}
                </Typography>
                <Stack spacing={2}>
                  {items.map((product) => (
                    <Card
                      key={product.id}
                      onClick={() => {
                        setSelected(product);
                        setMultiSelections({});
                      }}
                      sx={{
                        display: "flex",
                        cursor: "pointer",
                        "&:hover": { boxShadow: 6 },
                      }}
                    >
                      {product.imageUrl && (
                        <CardMedia
                          component="img"
                          image={product.imageUrl}
                          alt={product.name}
                          sx={{ width: 100 }}
                        />
                      )}
                      <CardContent sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="bold"
                            noWrap
                          >
                            {product.name}
                          </Typography>
                          {product.isVegan && (
                            <EcoIcon fontSize="small" color="success" />
                          )}
                          {product.glutenFree && (
                            <NoMealsIcon fontSize="small" color="warning" />
                          )}
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {product.description ?? "Sin descripción"}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          color="green"
                          fontWeight="bold"
                        >
                          ${product.price.toFixed?.(2) ?? product.price}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Box>
            ))}
          {products?.length === 0 && !productsLoading && (
            <Typography align="center" color="text.secondary">
              No hay productos para mostrar aquí.
            </Typography>
          )}
        </Stack>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button
            onClick={() => setViewingOrder(true)}
            variant="contained"
            color="primary"
          >
            Ver Orden de la Mesa
          </Button>
        </Box>
      </Box>
    );
  }

  const {
    imageUrl,
    name,
    description,
    price,
    productOptions,
    acceptsNotes,
    id,
  } = selected;

  if (showModal && selected) {
    const basePrice = Number(selected.price) * quantity;

    const optionsExtraPrice =
      selected.productOptions.reduce((total, opt) => {
        const multi = multiSelections[opt.id] ?? [];
        const single = singleSelections[opt.id];

        const selectedValueIds =
          opt.type === "single-choice"
            ? single !== undefined
              ? [single]
              : []
            : multi;

        const selectedValues = opt.productOptionValues.filter((val) =>
          selectedValueIds.includes(val.id)
        );

        const sumOfValues = selectedValues.reduce(
          (sum, val) => sum + Number(val.price),
          0
        );

        return total + sumOfValues;
      }, 0) * quantity;

    finalPrice = basePrice + optionsExtraPrice;
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 480,
        mx: "auto",
        p: 2,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
      }}
    >
      <IconButton onClick={() => setSelected(null)} sx={{ mb: 2, width: "9%" }}>
        <ArrowBackIcon />
      </IconButton>

      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={name}
          sx={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            borderRadius: 2,
            mb: 2,
          }}
        />
      )}

      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Typography variant="h5" fontWeight="bold">
          {name}
        </Typography>
        {selected.isVegan && <EcoIcon fontSize="small" color="success" />}
        {selected.glutenFree && (
          <NoMealsIcon fontSize="small" color="warning" />
        )}
      </Stack>

      <Box mb={1}>
        {selected.isVegan && (
          <Typography variant="body2" color="success.main" fontWeight="medium">
            Producto vegano
          </Typography>
        )}
        {selected.glutenFree && (
          <Typography variant="body2" color="warning.main" fontWeight="medium">
            Producto sin glúten
          </Typography>
        )}
      </Box>

      {description && (
        <Typography variant="body1" color="text.secondary" mb={1}>
          {description}
        </Typography>
      )}

      <Typography variant="h6" color="success.main" fontWeight="bold" mb={2}>
        ${price.toFixed?.(2) ?? price}
      </Typography>

      {productOptions.map((option) => (
        <Box key={option.id} mb={3}>
          <Typography variant="subtitle1" fontWeight="medium">
            {option.name}
          </Typography>
          {option.description && (
            <Typography variant="caption" color="text.secondary">
              {option.description}
            </Typography>
          )}
          <Box mt={1}>
            {option.type === "single-choice" ? (
              <FormGroup>
                {option.productOptionValues.map((val) => (
                  <FormControlLabel
                    key={val.id}
                    control={
                      <Radio
                        name={`option-${option.id}`}
                        checked={singleSelections[option.id] === val.id}
                        onChange={() => selectSingleOption(option.id, val.id)}
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <span>{val.description}</span>
                        {parseFloat(val.price) !== 0 && (
                          <Typography variant="caption" color="text.secondary">
                            +${parseFloat(val.price).toFixed(0)}
                          </Typography>
                        )}
                      </Stack>
                    }
                  />
                ))}
              </FormGroup>
            ) : (
              <FormGroup>
                {option.productOptionValues.map((val) => {
                  const checked = isChecked(option.id, val.id);
                  const disabled =
                    !checked &&
                    (multiSelections[option.id]?.length ?? 0) >= option.limit;
                  return (
                    <FormControlLabel
                      key={val.id}
                      control={
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleCheckbox(option, val.id)}
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span>{val.description}</span>
                          {parseFloat(val.price) !== 0 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              +${parseFloat(val.price).toFixed(0)}
                            </Typography>
                          )}
                        </Stack>
                      }
                      sx={{ opacity: disabled ? 0.4 : 1 }}
                    />
                  );
                })}
                <Typography variant="caption" color="text.secondary">
                  Podés elegir hasta {option.limit}.
                </Typography>
              </FormGroup>
            )}
          </Box>
        </Box>
      ))}

      {acceptsNotes && (
        <Box>
          <TextField
            fullWidth
            label="Notas adicionales"
            placeholder="Especificaciones, alergias, etc."
            multiline
            minRows={3}
            value={notes[id] ?? ""}
            onChange={(e) => {
              const value = e.target.value.slice(0, textAreaMaxLength);
              setNotes((prev) => ({
                ...prev,
                [id]: value,
              }));
            }}
            helperText={`${
              notes[id]?.length ?? 0
            }/${textAreaMaxLength} caracteres`}
          />
        </Box>
      )}

      <Box mt={3} mb={2} alignItems="center">
        <Typography variant="subtitle1" fontWeight="medium">
          Cantidad
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1}
            color="primary"
          >
            <RemoveIcon />
          </IconButton>

          <Typography variant="h6">{quantity}</Typography>

          <IconButton
            onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
            color="primary"
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      <Button
        onClick={() => setShowModal(true)}
        variant="contained"
        color="primary"
      >
        Agregar a la orden
      </Button>

      {showModal && selected && (
        <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Agregar a la orden</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1">
              <strong>Producto:</strong> {selected.name}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Cantidad:</strong> {quantity}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Precio de la orden:</strong> ${finalPrice.toFixed(2)}
            </Typography>
            {notes[id] && (
              <Typography variant="subtitle1">
                <strong>Notas:</strong> {notes[id]}
              </Typography>
            )}

            {(Object.keys(singleSelections).length > 0 ||
              Object.keys(multiSelections).length > 0) && (
              <Box mt={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Opciones seleccionadas:
                </Typography>
                <List dense disablePadding>
                  {selected.productOptions.map((opt) => {
                    const multi = multiSelections[opt.id] ?? [];
                    const single = singleSelections[opt.id];

                    if (multi.length === 0 && !single) return null;

                    const values =
                      opt.type === "single-choice"
                        ? opt.productOptionValues.filter(
                            (val) => val.id === single
                          )
                        : opt.productOptionValues.filter((val) =>
                            multi.includes(val.id)
                          );

                    return (
                      <ListItem key={opt.id} disablePadding>
                        <ListItemText
                          primary={`${opt.name}: ${values
                            .map((val) => val.description)
                            .join(", ")}`}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setShowModal(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={async () => {
                const options = selected.productOptions
                  .map((opt) => {
                    const multi = multiSelections[opt.id] ?? [];
                    const single = singleSelections[opt.id];

                    const values =
                      opt.type === "single-choice"
                        ? single !== undefined
                          ? [single]
                          : []
                        : multi;

                      return values.length > 0
                        ? { productOptionId: opt.id, productOptionValues: values }
                        : null;
                    })
                    .filter(Boolean) as { productOptionId: number; productOptionValues: number[] }[];

                  const newOrder: CreateOrderDTO = {
                    tableId: 1, // TODO: replace with actual tableId
                    tableSessionId: tableSessionId || 0,
                    restaurantId: restaurantId,
                    products: [
                      {
                        productId: selected.id,
                        quantity: quantity,
                        productOptions: options.length > 0 ? options : undefined,
                        note: notes[id]?.trim() !== "" ? notes[id] : undefined,
                      },
                    ],
                  };

                  try {
                    const res = await fetch(`${apiBaseUrl}/orders`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(newOrder),
                    });
                    if (!res.ok) throw new Error("Error al crear orden");
                    // TODO: ADD TOAST NOTIFICATION
                  } catch (e) {
                    console.error(e);
                    alert("No se pudo agregar el producto a la orden.");
                    return;
                  }

                  setShowModal(false);
                }}
              >
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>
        )}
    </Box>
  );
};

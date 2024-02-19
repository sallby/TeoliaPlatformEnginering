resource "azurerm_resource_group" "rg_name" {
  name     = "${var.nomRessource}-$(uuid())"
  location = var.localisation
}

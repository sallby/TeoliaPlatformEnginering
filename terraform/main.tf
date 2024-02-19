resource "azurerm_resource_group" "rg_name" {
  count    = 1
  name     = var.nomRessource
  location = var.localisation
}

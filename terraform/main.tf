resource "azurerm_resource_group" "rg_name" {
  count    = var.count
  name     = var.nomRessource
  location = var.localisation
}

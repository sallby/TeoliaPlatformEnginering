resource "azurerm_resource_group" "rg" {
  name     = var.nomRessource
  location = var.localisation
  lifecycle {
    create_before_destroy = true
  }
}

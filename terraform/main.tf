resource "random_pet" "pet" {
  length    = 2
  separator = "-"
}

resource "azurerm_resource_group" "rg_name" {
  name     = "${var.nomRessource}-${random_pet.pet.id}"
  location = var.localisation
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
  skip_provider_registration = true
}

module "rg" {
  source       = "./modules/resource_group"
  nomRessource = var.nomRessource
  localisation = var.localisation
}

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

resource "azurerm_policy_definition" "vm_compliance_policy" {
  name         = "vm-compliance-policy"
  display_name = "Politique de conformité VM"
  description  = "Vérifie que les VM sont conformes aux critères spécifiés"
  policy_type  = "Custom"
  mode         = "All"

  policy_rule = jsonencode({
    if = {
      allOf = [
        {
          field = "location"
          in    = ["westeurope", "northeurope", "francecentral"]
        },
        {
          field = "Microsoft.Compute/virtualMachines/hardwareProfile.vmSize"
          notIn = ["Standard_D9_v4", "Standard_D8s_v4", "Standard_D8_v4", "Standard_D4s_v4", "Standard_D4_v4", "Standard_D2s_v4", "Standard_D2_v4"]
        },
        {
          field  = "Microsoft.Compute/disks/sku.name"
          equals = "StandardSSD_LRS"
        },
        {
          field = "Microsoft.Compute/virtualMachines/hardwareProfile.vmSize"
          notIn = ["Standard_E8s_v4", "Standard_E8_v4", "Standard_E4s_v4", "Standard_E4_v4", "Standard_E2s_v4", "Standard_E2_v4"]
        }
      ]
    },
    then = {
      effect = "audit"
    }
  })
}

resource "azurerm_policy_assignment" "vm_compliance_assignment" {
  name                 = "vm-compliance-assignment"
  policy_definition_id = azurerm_policy_definition.vm_compliance_policy.id
  scope                = module.rg.resource_group_id
  description          = "Assignment of VM Compliance Policy"
}

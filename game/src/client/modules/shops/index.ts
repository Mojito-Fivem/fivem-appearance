import { QBCore } from '../../qbcore';
import { PlayerData } from 'qbcore.js/common/common';
import {Delay} from "../../utils";

const exp = global.exports;
let PlayerData: PlayerData = null;
// let lastZone: number = null;
let currentAction: string = null;
// let currentActionMessage: string = null;
// let hasEnteredMarker: boolean = false;

onNet('QBCore:ClientOnPlayerLoaded', () => {
  QBCore.Functions.TriggerCallback('fivem-appearance:getskin', skin => {
    exp['fivem-appearance'].setPlayerAppearance(skin);
  });
  PlayerData = QBCore.Functions.GetPlayerData();
});

onNet('fivem-appearance:CreateFirstCharacter', () => {
  QBCore.Functions.GetPlayerData((pData: PlayerData) => {
    const skin = pData.charinfo.gender === 1 ? 'mp_f_freemode_01' : 'mp_m_freemode_01';
    exp['fivem-appearance'].setPlayerModel(skin);
    const config = {
      ped: true,
      headBlend: true,
      faceFeatures: true,
      headOverlays: true,
      components: true,
      props: true,
    };
    exp['fivem-appearance'].setPlayerAppearance(appearance => {
      if (appearance) {
        emitNet('fivem-appearance:save', appearance);
      }
    }, config);
  });
});

onNet('fivem-appearance:hasExitedMarker', (zone) => {
  currentAction = zone;
});

onNet('fivem-appearance:clothingShop', () => {
  const menu: QBMenu = [
    {
      header: 'Clothing Store Options',
      isMenuHeader: true,
    },
    {
      header: 'Buy Clothing - $200',
      txt: 'Pick from a wide range of items to wear',
      params: {
        event: 'fivem-appearance:clothingMenu',
      },
    },
    {
      header: 'Change Outfit',
      txt: 'Pick from any of your currently saved outfits',
      params: {
        event: 'fivem-appearance:pickNewOutfit',
        args: {
          number: 1,
          id: 2,
        },
      },
    },
    {
      header: 'Save New outfit',
      txt: 'Save a new outfit you can use later',
      params: {
        event: 'fivem-appearance:saveOutfit',
      },
    },
    {
      header: 'Delete Outfit',
      txt: "Yeah... We didn't like that one either",
      params: {
        event: 'fivem-appearance:deleteOutfitMenu',
        args: {
          number: 1,
          id: 2,
        },
      },
    },
  ];
  exp['qb-menu'].openMenu(menu);
});

onNet('fivem-appearance:clothingMenu', () => {
  QBCore.Functions.TriggerCallback('fivem-appearance:buyclothing', (success: boolean) => {
    if (success) {
      const config: CustomizationConfig = {
        ped: false,
        headBlend: false,
        faceFeatures: false,
        headOverlays: false,
        components: true,
        props: true,
      };
      exp['fivem-appearance'].startPlayerCustomization(appearance => {
        if (appearance) {
          emitNet('fivem-appearance:save');
        }
      }, config);
    } else {
      QBCore.Functions.Notify('You cannot afford this', 'error');
    }
  });
});

onNet('fivem-appearance:barberMenu', () => {
  const config: CustomizationConfig = {
    ped: false,
    headBlend: false,
    faceFeatures: false,
    headOverlays: true,
    components: false,
    props: false,
  };
  exp['fivem-appearance'].startPlayerCustomization(appearance => {
    if (appearance) {
      emitNet('fivem-appearance:save');
    }
  }, config);
});

onNet('fivem-appearance:pickNewOutfit', () => {
  QBCore.Functions.TriggerCallback('fivem-appearance:getOutfits', (outfits: Outfit[]) => {
    const outfitMenu: QBMenu = [
      {
        header: '< Go Back',
        params: {
          event: 'fivem-appearance:clothingShop',
        },
      },
    ];
    outfits.forEach(outfit => {
      outfitMenu.push({
        header: outfit.name,
        params: {
          event: 'fivem-appearance:setOutfit',
          args: {
            ped: outfit.pedModel,
            components: outfit.pedComponents,
            props: outfit.pedProps,
          },
        },
      });
    });
    exp['qb-menu'].openMenu(outfitMenu);
  });
});

onNet('fivem-appearance:setOutfit', async data => {
  const { ped, components, props } = data;
  let pedId = PlayerPedId();
  const currentModel = exp['fivem-appearance'].getPedModel(pedId);
  if (currentModel !== ped) {
    exp['fivem-appearance'].setPlayerModel(ped);
  }
  await Delay(500);
  pedId = PlayerPedId();
  exp['fivem-appearance'].setPedComponents(components);
  exp['fivem-appearance'].setPedProps(props);
  const appearance = exp['fivem-appearance'].getPedAppearance(pedId);
  emitNet('fivem-appearance:save', appearance);
});

onNet('fivem-appearance:saveOutfit', async () => {
  const input = await exp['qb-input'].ShowInput({
    header: 'Name your outfit',
    submitText: 'Create Outfit',
    inputs: [
      {
        text: 'Outfit Name',
        name: 'input',
        type: 'text',
        isRequired: true,
      },
    ],
  });
  if (input) {
    const pedId = PlayerPedId();
    const model = exp['fivem-appearance'].getPedModel(pedId);
    const components = exp['fivem-appearance'].getPedComponents(pedId);
    const props = exp['fivem-appearance'].getPedProps(pedId);
    emitNet('fivem-appearance:saveOutfit', input.input, model, components, props);
  }
});

onNet('fivem-appearance:deleteOutfitMenu', () => {
  QBCore.Functions.TriggerCallback('fivem-appearance:getOutfits', (outfits: Outfit[]) => {
    const DeleteMenu: QBMenu = [
      {
        header: '< Go Back',
        params: {
          event: 'fivem-appearance:clothingShop',
        },
      },
    ];
    outfits.forEach(outfit => {
      DeleteMenu.push({
        header: 'Delete' + outfit.name,
        txt: 'This action cannot be undone!',
        params: {
          event: 'fivem-appearance:deleteOutfit',
          args: {
            id: outfit.id,
          },
        },
      });
    });
  });
});

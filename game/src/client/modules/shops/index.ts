import { QBCore } from '../../qbcore';
import { PlayerData } from 'qbcore.js/common/common';

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

onNet('fivem-appearance:pickNewOutfit', (data) => {
  const id = data.id;
  const number = data.number;
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

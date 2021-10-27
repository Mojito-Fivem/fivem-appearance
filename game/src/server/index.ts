import { QBCore } from './qbcore';
import { monitorEventLoopDelay } from 'perf_hooks';

const exp = (global as any).exports;

QBCore.Functions.CreateCallback('fivem-appearance:getskin', async (source, cb) => {
  const Player = QBCore.Functions.GetPlayer(source);
  const { skin } = await exp.oxmysql.singleSync('SELECT skin FROM players WHERE citizenid = :cid', {
    cid: Player.PlayerData.citizenid,
  });
  if (skin) {
    cb(JSON.parse(skin));
  } else {
    cb({});
  }
});

onNet('fivem-appearance:save', appearance => {
  const Player = QBCore.Functions.GetPlayer(global.source);
  exp.oxmysql.execute('UPDATE players SET skin = ? WHERE citizenid = ?', [
    JSON.stringify(appearance),
    Player.PlayerData.citizenid,
  ]);
});

onNet('fivem-appearance:saveOutfit', (name, model, components, props) => {
  const Player = QBCore.Functions.GetPlayer(global.source);
  exp.oxmysql.execute(
    'INSERT INTO player_outfits (citizenid, name, ped, components, props) VALUES (:cid, :name, :ped, :components, :props)',
    {
      cid: Player.PlayerData.citizenid,
      name: name,
      ped: JSON.stringify(model),
      components: JSON.stringify(components),
      props: JSON.stringify(props),
    },
  );
});

QBCore.Functions.CreateCallback('fivem-appearance:getOutfits', (source, cb) => {
  const Player = QBCore.Functions.GetPlayer(source);
  const outfits = [];
  exp.oxmysql.execute(
    'SELECT * FROM player_outfits WHERE citizenid = :cid',
    {
      cid: Player.PlayerData.citizenid,
    },
    res => {
      if (res) {
        res.forEach(outfit => {
          outfits.push({
            id: outfit.id,
            name: outfit.name,
            ped: JSON.parse(outfit.ped),
            components: JSON.parse(outfit.components),
            props: JSON.parse(outfit.props),
          });
        });
      }
    },
  );
  cb(outfits);
});

onNet('fivem-appearance:deleteOutfit', (id: number) => {
  const Player = QBCore.Functions.GetPlayer(global.source);
  exp.oxmysql.execute('DELETE FROM player_outfits WHERE id = :id AND citizenid = :cid', {
    id: id,
    cid: Player.PlayerData.citizenid,
  });
});

QBCore.Functions.CreateCallback('fivem-appearance:buyclothing', (source, cb) => {
  const Player = QBCore.Functions.GetPlayer(source);
  if (Player.Functions.RemoveMoney('cash', 250, 'bought-clothing')) {
    cb(true);
  } else {
    cb(false);
  }
});

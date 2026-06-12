const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const router = express.Router();

router.get('/check/:instrumentId', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: '未登录' });
  }
  const favorites = readJSON('favorites.json', []);
  const exists = favorites.some(f => f.userId === userId && f.instrumentId === req.params.instrumentId);
  res.json({ favorited: exists });
});

router.get('/user/:userId', (req, res) => {
  const favorites = readJSON('favorites.json', []);
  const instruments = readJSON('instruments.json', []);
  const users = readJSON('users.json', []);
  const borrows = readJSON('borrows.json', []);

  const userId = req.params.userId;
  const userFavs = favorites.filter(f => f.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const result = userFavs.map(fav => {
    const instrument = instruments.find(i => i.id === fav.instrumentId);
    if (!instrument) {
      return {
        ...fav,
        instrument: null,
        instrumentStatus: 'deleted',
        statusText: '已删除'
      };
    }

    const owner = users.find(u => u.id === instrument.ownerId) || null;

    let statusText = '可借用';
    if (instrument.status === 'borrowed') {
      statusText = '借用中';
    } else if (instrument.status === 'pending') {
      statusText = '审核中';
    } else if (instrument.status === 'offline' || instrument.status === 'unavailable') {
      statusText = '已下架';
    } else if (instrument.status !== 'available') {
      statusText = instrument.status;
    }

    const activeBorrow = borrows.find(b => 
      b.instrumentId === instrument.id && 
      (b.status === 'borrowing' || b.status === 'pending')
    );

    return {
      ...fav,
      instrument: {
        ...instrument,
        owner
      },
      instrumentStatus: instrument.status,
      statusText,
      activeBorrow: activeBorrow || null
    };
  });

  res.json(result);
});

router.post('/', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: '未登录' });
  }

  const { instrumentId } = req.body;
  if (!instrumentId) {
    return res.status(400).json({ error: '缺少乐器ID' });
  }

  const favorites = readJSON('favorites.json', []);
  const instruments = readJSON('instruments.json', []);

  const instrument = instruments.find(i => i.id === instrumentId);
  if (!instrument) {
    return res.status(404).json({ error: '乐器不存在' });
  }

  const exists = favorites.find(f => f.userId === userId && f.instrumentId === instrumentId);
  if (exists) {
    return res.json({ success: true, favorited: true, favorite: exists });
  }

  const newFavorite = {
    id: 'f' + uuidv4().slice(0, 8),
    userId,
    instrumentId,
    ownerId: instrument.ownerId,
    createdAt: new Date().toISOString()
  };

  favorites.push(newFavorite);
  writeJSON('favorites.json', favorites);

  res.json({ success: true, favorited: true, favorite: newFavorite });
});

router.delete('/:instrumentId', (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: '未登录' });
  }

  const favorites = readJSON('favorites.json', []);
  const filtered = favorites.filter(f => !(f.userId === userId && f.instrumentId === req.params.instrumentId));

  if (filtered.length === favorites.length) {
    return res.json({ success: true, favorited: false });
  }

  writeJSON('favorites.json', filtered);
  res.json({ success: true, favorited: false });
});

module.exports = router;

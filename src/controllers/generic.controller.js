export function listFactory(Model, include=[]) {
  return async (req, res, next) => {
    try {
      const items = await Model.findAll({ include });
      res.json(items);
    } catch (err) { next(err); }
  };
}

export function getFactory(Model, include=[]) {
  return async (req, res, next) => {
    try {
      const id = req.params.id;
      const item = await Model.findByPk(id, { include });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) { next(err); }
  };
}

export function createFactory(Model) {
  return async (req, res, next) => {
    try {
      const created = await Model.create(req.body);
      res.status(201).json(created);
    } catch (err) { next(err); }
  };
}

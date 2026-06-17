class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(data, options = {}) {
    return this.model.create(data, options);
  }

  findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  findOne(where, options = {}) {
    return this.model.findOne({ where, ...options });
  }

  findAll(options = {}) {
    return this.model.findAll(options);
  }

  findAndCountAll(options = {}) {
    return this.model.findAndCountAll(options);
  }

  count(options = {}) {
    return this.model.count(options);
  }

  async update(instanceOrId, data, options = {}) {
    const instance =
      typeof instanceOrId === 'object' ? instanceOrId : await this.findById(instanceOrId);
    if (!instance) return null;
    return instance.update(data, options);
  }

  destroy(where, options = {}) {
    return this.model.destroy({ where, ...options });
  }
}

module.exports = BaseRepository;

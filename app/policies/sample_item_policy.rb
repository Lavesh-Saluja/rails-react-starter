# The sample is intentionally public: there is no authentication yet, so `user` is nil.
# When authentication is added, base these rules on `user` (e.g. record.user_id == user.id).
class SampleItemPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def create?
    true
  end

  def update?
    true
  end

  def destroy?
    true
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end
end

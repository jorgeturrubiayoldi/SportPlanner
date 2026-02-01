using Supabase.Gotrue;
using Supabase.Gotrue.Interfaces;

namespace SportPlannerNW.Services;

public class NoOpSessionHandler : IGotrueSessionPersistence<Session>
{
    public void SaveSession(Session session)
    {
        // Do nothing
    }

    public Session? LoadSession()
    {
        return null;
    }

    public void DestroySession()
    {
        // Do nothing
    }
}

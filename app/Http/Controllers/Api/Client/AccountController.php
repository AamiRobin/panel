<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Auth\AuthManager;
use Pterodactyl\Services\Users\UserUpdateService;
use Pterodactyl\Transformers\Api\Client\AccountTransformer;
use Pterodactyl\Http\Requests\Api\Client\Account\UpdateEmailRequest;
use Pterodactyl\Http\Requests\Api\Client\Account\UpdatePasswordRequest;

class AccountController extends ClientApiController
{
    /**
     * @var \Illuminate\Auth\SessionGuard
     */
    private $authManager;

    private UserUpdateService $updateService;

    /**
     * AccountController constructor.
     */
    public function __construct(AuthManager $authManager, UserUpdateService $updateService)
    {
        parent::__construct();

        $this->authManager = $authManager;
        $this->updateService = $updateService;
    }

    /**
     * Gets information about the currently authenticated user.
     */
    public function index(Request $request): array
    {
        return $this->fractal->item($request->user())
            ->transformWith(AccountTransformer::class)
            ->toArray();
    }

    /**
     * Update the authenticated user's email address.
     */
    public function updateEmail(UpdateEmailRequest $request): Response
    {
        $this->updateService->handle($request->user(), $request->validated());

        return $this->returnNoContent();
    }

    /**
     * Update the authenticated user's password. All existing sessions will be logged
     * out immediately.
     *
     * @throws \Throwable
     */
    public function updatePassword(UpdatePasswordRequest $request): Response
    {
        $user = $this->updateService->handle($request->user(), $request->validated());

        // If you do not update the user in the session you'll end up working with a
        // cached copy of the user that does not include the updated password. Do this
        // to correctly store the new user details in the guard and allow the logout
        // other devices functionality to work.
        $this->authManager->setUser($user);

        $this->authManager->logoutOtherDevices($request->input('password'));

        return $this->returnNoContent();
    }
}

import { useEffect } from "react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { FormEventHandler } from "react";
import { PageProps } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InputError } from "@/components/ui/input-error";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import  UpdateAvatar  from "@/components/profile/update-avatar";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage<PageProps>().props.auth.user;

    console.log('Initial User Data:', user);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user?.name || '',
            email: user?.email || '',
            bio: user?.bio || '',
        });

    useEffect(() => {
        if (user) {
            setData({
                name: user.name,
                email: user.email,
                bio: user.bio || '',
            });
        }
    }, [user]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        console.log('Form Data:', {
            name: data.name,
            email: data.email,
            bio: data.bio,
        });

        patch(route("profile.update"), {
            preserveScroll: true,
            onError: (errors) => {
                console.log('Validation Errors:', errors);
            },
            data: {
                name: data.name,
                email: data.email,
                bio: data.bio,
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="mt-6 space-y-6">
                <UpdateAvatar user={user} />

                <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        className="mt-1 block w-full"
                        onChange={(e) => setData("bio", e.target.value)}
                        rows={4}
                        defaultValue={data.bio}
                        placeholder="Tell us about yourself..."
                    />
                    <InputError className="mt-2" message={errors.bio} />
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2">
                            Your email address is unverified.
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="underline text-sm ms-2 text-muted-foreground rounded-md"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Save</Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

import createEgg from '@/api/admin/eggs/createEgg';
import { EggImageContainer, EggInformationContainer, EggLifecycleContainer, EggProcessContainer, EggProcessContainerRef, EggStartupContainer } from '@/components/admin/nests/eggs/EggSettingsContainer';
import Button from '@/components/elements/Button';
import FlashMessageRender from '@/components/FlashMessageRender';
import useFlash from '@/plugins/useFlash';
import { Form, Formik, FormikHelpers } from 'formik';
import React, { useRef } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import tw from 'twin.macro';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import { object } from 'yup';

interface Values {
    name: string;
    description: string;
    startup: string;
    dockerImages: string;
    configStop: string;
    configStartup: string;
    configFiles: string;
}

export default () => {
    const params = useParams<{ nestId: string }>();
    const history = useHistory();

    const { clearFlashes, clearAndAddHttpError } = useFlash();

    const ref = useRef<EggProcessContainerRef>();

    const submit = async (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('egg:create');

        const nestId = Number(params.nestId);

        values.configStartup = await ref.current?.getStartupConfiguration() || '';
        values.configFiles = await ref.current?.getFilesConfiguration() || '';

        createEgg({ ...values, dockerImages: values.dockerImages.split('\n'), nestId })
            .then(egg => history.push(`/admin/nests/${nestId}/eggs/${egg.id}`))
            .catch(error => {
                console.error(error);
                clearAndAddHttpError({ key: 'egg:create', error });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <AdminContentBlock title={'New Egg'}>
            <div css={tw`w-full flex flex-row items-center mb-8`}>
                <div css={tw`flex flex-col flex-shrink`} style={{ minWidth: '0' }}>
                    <h2 css={tw`text-2xl text-neutral-50 font-header font-medium`}>New Egg</h2>
                    <p css={tw`text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden`}>Add a new egg to the panel.</p>
                </div>
            </div>

            <FlashMessageRender key={'egg:create'} css={tw`mb-4`}/>

            <Formik
                onSubmit={submit}
                initialValues={{
                    name: '',
                    description: '',
                    startup: '',
                    dockerImages: '',
                    configStop: '',
                    configStartup: '{}',
                    configFiles: '{}',
                }}
                validationSchema={object().shape({
                })}
            >
                {({ isSubmitting, isValid }) => (
                    <Form>
                        <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6`}>
                            <EggInformationContainer/>
                        </div>

                        <EggStartupContainer css={tw`mb-6`}/>

                        <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6`}>
                            <EggImageContainer/>
                            <EggLifecycleContainer/>
                        </div>

                        <EggProcessContainer ref={ref} css={tw`mb-6`}/>

                        <div css={tw`bg-neutral-700 rounded shadow-md py-2 px-6 mb-16`}>
                            <div css={tw`flex flex-row`}>
                                <Button type="submit" size="small" css={tw`ml-auto`} disabled={isSubmitting || !isValid}>
                                   Create
                                </Button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </AdminContentBlock>
    );
};

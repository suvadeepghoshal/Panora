import config from '@/utils/config';
import { useMutation } from '@tanstack/react-query';
import {DefineTargetFieldDto} from "@api/src/@core/field-mapping/dto/create-custom-field.dto"
import toast from 'react-hot-toast';

const useDefineFieldMutation = () => {
    const defineField = async (data: DefineTargetFieldDto) => {
        const response = await fetch(`${config.API_URL}/field-mapping/define`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
            'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to define field mapping');
        }
        
        return response.json();
    };
    return useMutation({
        mutationFn: defineField,
        onMutate: () => {
            toast('Defining field...');
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        },
        onSuccess: () => {
            toast.success('Field mapping defined successfully!');
        },
        onSettled: () => {
        },
    });
};

export default useDefineFieldMutation;